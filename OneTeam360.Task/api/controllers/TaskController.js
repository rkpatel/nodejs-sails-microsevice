/***************************************************************************

  Controller     : Task

  **************************************************
  Functions
  **************************************************

  add
  edit
  delete
  find
  findById
  **************************************************

***************************************************************************/
const { commonListing, escapeSqlSearch } = require('../services/utils');
const messages = sails.config.globals.messages;
const TaskValidations = require('../validations/TaskValidation');
const {
  RESPONSE_STATUS,
  TASK_STATUS,
  ACCOUNT_STATUS,
  NOTIFICATION_ENTITIES,
  ACCOUNT_CONFIG_CODE,
  DEFAULT_TASK_TYPE,
  CRON_JOB_CODE,
  TASK_PERMISSION,
  AUTOMATED_TASK_ENTITY_TYPE,
} = require('../utils/constants/enums');
const {
  getDateUTC,
  getDateTimeSpecificTimeZone,
  getDateSpecificTimeZone,
  getCurrentDate,
  formatDate,
  getDateTimezone,
  getTomorrowDate,
  getAutomatedTaskDueDate,
  getScheduledTaskEndDate,
  getBetweenDate,
} = require('../utils/common/getDateTime');
const { copyImageFromTempToOri } = require('../services/azureStorage');
const moment = require('moment');
const { Parser } = require('json2csv');
const { sendNotification } = require('../services/sendNotification');
const validations = require('../utils/constants/validations');
const { uploadDocument } = require('../services/uploadDocument');
const tmpUploadDirOnAzureForTask =
  process.env.TMP_IMG_UPLOAD_DIR_ON_AZURE_FOR_TASK;
const uploadDirOnAzureForTask = process.env.IMG_UPLOAD_DIR_ON_AZURE_FOR_TASK;
const getImgUrl = function (imgUrlArr, account, taskId) {
  let mainUrl = `${process.env.PROFILE_PIC_CDN_URL}/${account.account_guid}/${uploadDirOnAzureForTask}/${taskId}`;
  let allUrl = [];
  const respImgArr = imgUrlArr.map((url) => {
    let arr = url.split('.');
    let thumb_img_url = `${arr[0]}_thumbnail.${arr[1]}`;
    allUrl.push(url);
    allUrl.push(thumb_img_url);
    return {
      image_url           : `${mainUrl}/${url}`,
      image_thumbnail_url : `${mainUrl}/${thumb_img_url}`,
    };
  });
  return { respImgArr, allUrl };
};

const getTaskDetails = async function (req, taskId) {
  const results = await Task.findOne({ task_id: taskId }).usingConnection(
    req.dynamic_connection
  );
  if (results && results.task_id) {
    results['task_images'] = await TaskImage.find({
      task_id: taskId,
    }).usingConnection(req.dynamic_connection);
    let sql = `
              SELECT 
                TA.task_status,TA.assigned_to as employee_profile_id,EP.status as profile_status,EP.user_id, CONCAT(user.first_name, ' ', user.last_name) as name, user.user_id, user.last_name, user.first_name,user.phone, user.email,created_by_user.email as created_by_email, created_by_user.user_id as created_by_user_id, created_by_user.last_name as created_by_lname, created_by_user.first_name as created_by_fname, createdby_EP.employee_profile_id as created_by_employee_profile_id, task.created_date
              FROM task_assignee TA
                JOIN employee_profile EP 
                  ON EP.employee_profile_id=TA.assigned_to
                JOIN ${process.env.DB_NAME}.user 
                  ON user.user_id = EP.user_id 
                JOIN task   
                  ON task.task_id=TA.task_id
                JOIN ${process.env.DB_NAME}.user created_by_user 
                  ON created_by_user.user_id = task.created_by
                JOIN employee_profile createdby_EP  
                  ON createdby_EP.user_id=created_by_user.user_id
                  WHERE TA.task_id=$1 AND TA.status=$2`;

    const rawResult = await sails
      .sendNativeQuery(escapeSqlSearch(sql), [taskId, TASK_STATUS.active])
      .usingConnection(req.dynamic_connection);
    const pendingAssignees = [];
    const completedAssignees = [];
    rawResult.rows.forEach((val) => {
      if (val.task_status === TASK_STATUS.completed) {
        completedAssignees.push(val);
      } else {
        pendingAssignees.push(val);
      }
    });

    results['pending_assignees'] = pendingAssignees;
    results['completed_assignees'] = completedAssignees;
    results.is_private = results.is_private === true ? 1 : 0;
    results.is_group_task = results.is_group_task === true ? 1 : 0;
    if (results.last_updated_by !== '' && results.last_updated_by !== null) {
      const completed_by = await Users.findOne({
        user_id: results.last_updated_by,
      });
      results.task_completed_by = `${completed_by.first_name} ${completed_by.last_name}`;
    } else {
      results.task_completed_by = '';
    }
    return results;
  } else {
    return false;
  }
};

const getTaskAssigneeDetails = async function (
  req,
  taskId,
  assigneeIds,
  isGroupTask = false
) {
  let taskSql = '';
  if (isGroupTask === false) {
    const assigneeName = assigneeIds.map((c) => `'${c}'`).join(', ');
    taskSql = await sails
      .sendNativeQuery(
        `SELECT task.task_id, ep.employee_profile_id as receipient_employee_profile_id, user.user_id as receipient_user_id, user.first_name as recipient_first_name, user.last_name as recipient_last_name, user.phone as recipient_phone, user.email as recipient_email from task 
    join task_assignee on task.task_id = task_assignee.task_id
    join employee_profile ep on task_assignee.assigned_to = ep.employee_profile_id
    join ${process.env.DB_NAME}.user on ep.user_id = user.user_id
    where ep.employee_profile_id in (${assigneeName}) and task.task_id = ${taskId}`
      )
      .usingConnection(req.dynamic_connection);
  } else {
    taskSql = await sails
      .sendNativeQuery(
        `SELECT task.task_id, ep.employee_profile_id as receipient_employee_profile_id, user.user_id as receipient_user_id, user.first_name as recipient_first_name, user.last_name as recipient_last_name, user.phone as recipient_phone, user.email as recipient_email from task 
    join task_assignee on task.task_id = task_assignee.task_id
    join employee_profile ep on task_assignee.assigned_to = ep.employee_profile_id
    join ${process.env.DB_NAME}.user on ep.user_id = user.user_id
    where task.task_id = ${taskId}`
      )
      .usingConnection(req.dynamic_connection);
  }
  return taskSql.rows;
};

const getTaskAssignerDetails = async function (req, taskId = false) {
  let taskSql = await sails
    .sendNativeQuery(
      `SELECT task.task_id, ep.employee_profile_id as receipient_employee_profile_id, user.user_id as receipient_user_id, user.first_name as recipient_first_name, user.last_name as recipient_last_name, user.phone as recipient_phone, user.email as recipient_email from task 
    join employee_profile ep on task.assigned_by = ep.employee_profile_id
    join ${process.env.DB_NAME}.user on ep.user_id = user.user_id
    where task.task_id = ${taskId}`
    )
    .usingConnection(req.dynamic_connection);
  return taskSql.rows;
};

const _onverdueReminderCron = async (curentTimeUTC, checkTenantTimezone) => {
  sails.log.debug('Task OverDue Cron Execution Start');
  let sql = `
    SELECT
        account.account_id,
        account_configuration_detail.value,
        account_configuration_detail.code
      from account
      INNER JOIN
        account_configuration ON account.account_id = account_configuration.account_id
      INNER JOIN
        account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
      Where
        account_configuration_detail.code IN ($1,$2,$3,$4,$5) and account.status = $6;`;

  const rawResult = await sails.sendNativeQuery(sql, [
    ACCOUNT_CONFIG_CODE.tenant_db_connection_string,
    ACCOUNT_CONFIG_CODE.time_zone,
    ACCOUNT_CONFIG_CODE.date_time_format,
    ACCOUNT_CONFIG_CODE.date_format,
    ACCOUNT_CONFIG_CODE.cron_task_overDue,
    ACCOUNT_STATUS.active,
  ]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map((item) => item.account_id))];
  let accountArray = accountIds
    ? accountIds.map((id) => {
      let tenant_db_connection_string = results.find(
          (a) =>
            a.account_id === id &&
            a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string
      );
      let time_zone = results.find(
          (a) => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone
      );
      let date_time_format = results.find(
          (a) =>
            a.account_id === id &&
            a.code === ACCOUNT_CONFIG_CODE.date_time_format
      );
      let date_format = results.find(
          (a) =>
            a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format
      );
      let cron_task_overDue = results.find(
          (a) =>
            a.account_id === id &&
            a.code === ACCOUNT_CONFIG_CODE.cron_task_overDue
      );
      return {
        account_id                  : id,
        tenant_db_connection_string : tenant_db_connection_string
            ? tenant_db_connection_string.value
            : '',
        time_zone        : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
        date_time_format : date_time_format
            ? date_time_format.value
            : process.env.ACCOUNT_DATETIMEFORMAT,
        date_format: date_format
            ? date_format.value
            : process.env.ACCOUNT_DATEFORMAT,
        cron_task_overDue: cron_task_overDue
            ? cron_task_overDue.value
            : process.env.CRON_TASK_OVERDUE,
      };
    })
    : [];

  for (const item of accountArray) {
    let timezone = item.time_zone ? item.time_zone : '';
    if (timezone === '') {
      continue;
    }

    let tenantTime = getDateTimeSpecificTimeZone(
      curentTimeUTC,
      timezone,
      'HH:mm'
    );
    sails.log(timezone, tenantTime, item.cron_task_overDue, item.account_id);

    if (checkTenantTimezone && tenantTime !== item.cron_task_overDue) {
      continue;
    }

    // Tenant specific database connection
    let connectionString = item.tenant_db_connection_string;
    if (connectionString) {
      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let connectionString1 = item.tenant_db_connection_string;
      let tenantConnection = await mysql.createConnection(connectionString1);
      await tenantConnection.connect();

      let cronJob = await CronJob.findOne({
        code: CRON_JOB_CODE.task_overdue,
      }).usingConnection(tenantConnection);

      if (cronJob) {
        let currentDate = getDateUTC();
        let obj;
        let start_date = cronJob.last_processing_date
          ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss')
          : '0000-00-00 00:00:00';
        sails.log(start_date);

        try {
          // Update overdue task  status
          const task = await Task.find({
            end_date    : { '<': getDateTimezone(timezone) },
            task_status : TASK_STATUS.pending,
          }).usingConnection(tenantConnection);
          if (task.length > 0) {
            for (const data of task) {
              const taskAssignee = await TaskAssignee.find({
                task_id     : data.task_id,
                task_status : TASK_STATUS.pending,
              }).usingConnection(tenantConnection);
              if (taskAssignee.length > 0) {
                for (const item1 of taskAssignee) {
                  await TaskAssignee.update(
                    { task_id: item1.task_id },
                    {
                      task_status: TASK_STATUS.overdue,
                    }
                  )
                    .fetch()
                    .usingConnection(tenantConnection);
                }
              }
              await Task.update(
                { task_id: data.task_id },
                {
                  task_status: TASK_STATUS.overdue,
                }
              )
                .fetch()
                .usingConnection(tenantConnection);
            }
          }
          // Search for Any Overdue Task
          let toBeoverdueTask = await Task.find({
            where: {
              task_status : TASK_STATUS.pending,
              end_date    : { like: `${getTomorrowDate()}%` },
            },
          }).usingConnection(tenantConnection);
          toBeoverdueTask = toBeoverdueTask
            ? toBeoverdueTask.filter(
                (item2) => item2.start_date !== item2.endDate
            )
            : [];
          if (toBeoverdueTask.length > 0) {
            for (const index in toBeoverdueTask) {
              let taskAssginees = await TaskAssignee.find({
                where: {
                  task_id     : toBeoverdueTask[index].task_id,
                  task_status : TASK_STATUS.pending,
                },
              }).usingConnection(tenantConnection);
              if (taskAssginees.length > 0) {
                // Below implmentation for sending overdue reminder all the assignees
                const _task = await getTaskDetails(
                  { dynamic_connection: tenantConnection },
                  toBeoverdueTask[index].task_id
                );
                let assignee_data = _task.pending_assignees
                  .filter((_a) => _a.task_status === TASK_STATUS.pending)
                  .map((_assignee) => ({
                    recipient_email                : _assignee.email,
                    recipient_first_name           : _assignee.first_name,
                    recipient_last_name            : _assignee.last_name,
                    receipient_user_id             : _assignee.user_id,
                    receipient_employee_profile_id :
                      _assignee.employee_profile_id,
                    employee_name: `${_assignee.created_by_fname} ${_assignee.created_by_lname}`,
                  }));
                await sendNotification(null, {
                  notification_entity:
                    NOTIFICATION_ENTITIES.TASK_OVERDUE_REMINDER,
                  assignees        : assignee_data,
                  account_id       : item.account_id,
                  task_title       : _task.title,
                  task_description : _task.description,
                  start_date       : _task.start_date
                    ? formatDate(_task.start_date, item.date_format)
                    : '',
                  end_date: _task.end_date
                    ? formatDate(_task.end_date, item.date_format)
                    : '',
                  task_id: toBeoverdueTask[index].task_id,
                });
              }
            }
          }
          await CronJob.update(
            { code: CRON_JOB_CODE.task_overdue },
            { last_processing_date: currentDate }
          ).usingConnection(tenantConnection);
          obj = {
            status : 'Success',
            error  : '',
          };
        } catch (error) {
          obj = {
            status : 'Failure',
            error  : `Error : ${error.message}`,
          };
        } finally {
          await CronJobLog.create({
            cron_job_id   : cronJob.cron_job_id,
            status        : obj.status,
            start_date    : currentDate,
            end_date      : getDateUTC(),
            error_message : obj.error,
          }).usingConnection(tenantConnection);
        }
      } else {
        // No Cron Jon with code Task Overdue
        sails.log('No Cron Jon with code Task Overdue');
      }
      if (tenantConnection) {
        await tenantConnection.end();
      }
    }
    // }
  }

  sails.log.debug('Task OverDue Cron Execution End');
};

const dueDays = async (account) => {
  let sql = `
  SELECT account_configuration_detail.value, account_configuration_detail.default_value
  FROM account_configuration_detail
  LEFT JOIN account_configuration ON account_configuration_detail.account_configuration_id = account_configuration.account_configuration_id
  WHERE account_configuration_detail.code IN ($1) AND account_configuration.account_id = $2 `;

  const rawResult = await sails.sendNativeQuery(sql, [
    ACCOUNT_CONFIG_CODE.automated_task_due_date_days,
    account,
  ]);
  const results = rawResult.rows;
  return results[0].value !== '' &&
    results[0].value !== null &&
    results[0].value !== undefined
    ? results[0].value
    : results[0].default_value;
};

const taskStartDate = async (taskDetails, req) => {
  return taskDetails.start_date
    ? formatDate(taskDetails.start_date, req.dateFormat)
    : '';
};

const taskEndDate = async (taskDetails, req) => {
  return taskDetails.end_date
    ? formatDate(taskDetails.end_date, req.dateFormat)
    : '';
};

const jobTypId = async (job_type_id) => {
  return job_type_id > 0 ? job_type_id : null;
};

const locId = async (location_id) => {
  return location_id > 0 ? location_id : null;
};

const addTaskStartDate = async (start_date, req) => {
  return start_date ? formatDate(start_date, req.dateFormat) : '';
};

const addTaskEndDate = async (end_date, req) => {
  return end_date ? formatDate(end_date, req.dateFormat) : '';
};

const isPrivate = async (is_private) => {
  return parseInt(is_private) === 0 || parseInt(is_private) === 1
    ? parseInt(is_private)
    : 0;
};

const isGroupTaskData = async (is_group_task) => {
  return parseInt(is_group_task) === 0 || parseInt(is_group_task) === 1
    ? parseInt(is_group_task)
    : 0;
};

const entityType = async (entity_type) => {
  return entity_type !== '' && entity_type !== null && entity_type !== undefined
    ? entity_type
    : null;
};

const entityId = async (entity_id) => {
  return entity_id !== '' && entity_id !== null && entity_id !== undefined
    ? entity_id
    : 0;
};

const trainingEmpId = async (training_employee_id) => {
  return training_employee_id !== '' &&
    training_employee_id !== null &&
    training_employee_id !== undefined
    ? training_employee_id
    : null;
};

const addTask = async function (req, request) {
  const {
    title,
    task_type_id,
    job_type_id,
    location_id,
    description,
    start_date,
    end_date,
    is_private,
    is_group_task,
    entity_type,
    entity_id,
    training_employee_id,
    assignees,
    task_images,
    is_scheduled,
    scheduled_interval_in_days,
    scheduled_task_end_date_interval,
    scheduled_end_date,
  } = request;

  const empProfileDetails = await EmployeeProfile.findOne({
    user_id: req.user.user_id,
  }).usingConnection(req.dynamic_connection);

  let task_status = TASK_STATUS.pending;
  let _end_date = moment(end_date);
  let current_date = moment(getCurrentDate());
  if (_end_date < current_date) {
    task_status = TASK_STATUS.overdue;
  }

  const newTask = await Task.create({
    title,
    task_type_id,
    job_type_id          : await jobTypId(job_type_id),
    location_id          : await locId(location_id),
    description,
    start_date,
    end_date,
    is_private           : await isPrivate(is_private),
    is_group_task        : await isGroupTaskData(is_group_task),
    entity_type          : await entityType(entity_type),
    entity_id            : await entityId(entity_id),
    training_employee_id : await trainingEmpId(training_employee_id),
    status               : TASK_STATUS.active,
    task_status          : task_status,
    is_scheduled         :
      parseInt(is_scheduled) === 0 || parseInt(is_scheduled) === 1
        ? parseInt(is_scheduled)
        : 0,
    scheduled_interval_in_days:
      scheduled_interval_in_days !== '' &&
      scheduled_interval_in_days !== null &&
      scheduled_interval_in_days !== undefined
        ? scheduled_interval_in_days
        : 0,
    scheduled_task_end_date_interval:
      scheduled_task_end_date_interval !== '' &&
      scheduled_task_end_date_interval !== null &&
      scheduled_task_end_date_interval !== undefined
        ? scheduled_task_end_date_interval
        : 0,
    scheduled_end_date:
      scheduled_end_date !== '' &&
      scheduled_end_date !== null &&
      scheduled_end_date !== undefined
        ? scheduled_end_date
        : null,
    assigned_by     : empProfileDetails.employee_profile_id,
    created_by      : req.user.user_id,
    last_updated_by : null,
    created_date    : getDateUTC(),
  })
    .fetch()
    .usingConnection(req.dynamic_connection);

  const taskId = newTask.task_id;

  const assignee_arr = assignees.map((assignee_id) => {
    return {
      task_id         : taskId,
      assigned_to     : assignee_id,
      status          : TASK_STATUS.active,
      task_status,
      created_by      : req.user.user_id,
      last_updated_by : req.user.user_id,
      created_date    : getDateUTC(),
    };
  });
  if (assignee_arr.length > 0) {
    await TaskAssignee.createEach(assignee_arr).usingConnection(
      req.dynamic_connection
    );
  }

  if (task_images && task_images.length > 0) {
    const account = req.account;
    const taskImg = getImgUrl(task_images, account, taskId);
    // Move images to respective task directory on azure
    await copyImageFromTempToOri(
      taskImg.allUrl,
      account.account_guid,
      taskId,
      tmpUploadDirOnAzureForTask
    );
    // Create image entries in task_images table.
    const task_img_arr = taskImg.respImgArr.map((taskImgDetails) => {
      return {
        task_id             : taskId,
        image_url           : taskImgDetails.image_url,
        image_thumbnail_url : taskImgDetails.image_thumbnail_url,
        status              : TASK_STATUS.active,
        created_by          : req.user.user_id,
        created_date        : getDateUTC(),
      };
    });
    if (task_img_arr.length > 0) {
      await TaskImage.createEach(task_img_arr).usingConnection(
        req.dynamic_connection
      );
    }
  }
  const newlyAddedtask = await getTaskDetails(req, taskId);

  // Below implementation for sending notification to all the assignees
  let assignee_data = newlyAddedtask.pending_assignees.map((_assignee) => ({
    recipient_email                : _assignee.email,
    recipient_first_name           : _assignee.first_name,
    recipient_last_name            : _assignee.last_name,
    recipient_phone                : _assignee.phone,
    receipient_user_id             : _assignee.user_id,
    receipient_employee_profile_id : _assignee.employee_profile_id,
  }));
  const user = await Users.findOne({ user_id: req.user.user_id });
  if(!req.isExposedApi){
    await sendNotification(req, {
      notification_entity : NOTIFICATION_ENTITIES.TASK_ASSIGNED,
      assignees           : assignee_data,
      account_id          : req.account.account_id,
      employee_name       : `${user.first_name} ${user.last_name}`,
      task_title          : title,
      task_description    : description,
      start_date          : await addTaskStartDate(start_date, req),
      end_date            : await addTaskEndDate(end_date, req),
      task_id             : taskId,
    });
  }
  return newlyAddedtask;
};

const tenantDbConnStringData=(tenant_db_connection_string)=>{
  return tenant_db_connection_string
  ? tenant_db_connection_string.value
  : '';
};

const accountArrayData = async (accountIds, results) => {
  return accountIds
    ? accountIds.map((id) => {
      let tenant_db_connection_string = results.find(
        (a) =>
          a.account_id === id &&
          a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string
      );
      let time_zone = results.find(
        (a) => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone
      );
      let date_time_format = results.find(
          (a) =>
            a.account_id === id &&
            a.code === ACCOUNT_CONFIG_CODE.date_time_format
      );
      let date_format = results.find(
          (a) =>
            a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format
      );

      let tenantDbConnString=tenantDbConnStringData(tenant_db_connection_string);
      return {
        account_id                  : id,
        tenant_db_connection_string : tenantDbConnString,
        time_zone                   : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
        date_time_format            : date_time_format
            ? date_time_format.value
            : process.env.ACCOUNT_DATETIMEFORMAT,
        date_format: date_format
            ? date_format.value
            : process.env.ACCOUNT_DATEFORMAT,
      };
    })
    : [];
};

const startDateDatas=async(cronJob)=>{
  return cronJob.last_processing_date
  ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss')
  : '0000-00-00 00:00:00';
};

const taskImageData=async(taskImages,newTask,req)=>{
  if (taskImages.length > 0) {
    const task_img_arr = taskImages.map((imgitem) => {
      return {
        task_id             : newTask.task_id,
        image_url           : imgitem.image_url,
        image_thumbnail_url : imgitem.image_thumbnail_url,
        status              : TASK_STATUS.active,
        created_by          : imgitem.created_by,
        created_date        : getDateUTC(),
      };
    });
    if (task_img_arr.length > 0) {
      await TaskImage.createEach(task_img_arr).usingConnection(
        req.dynamic_connection
      );
    }
  }
};

const taskRowsData=async(taskrows,req,tenantConnection)=>{
  if (taskrows.length > 0) {
    for (const data of taskrows) {
      let dateArray = getBetweenDate(
        data.start_date,
        data.scheduled_end_date,
        data.scheduled_interval_in_days
      );
      //sails.log(dateArray);
      // IF date is match with interval date
      if (dateArray.includes(getCurrentDate())) {
        const assignees = await TaskAssignee.find({
          task_id: data.task_id,
        })
          .select(['assigned_to'])
          .usingConnection(tenantConnection);
        const _taskAssigneesIds = assignees.map(
          (val) => val.assigned_to
        );

        const taskRequest = {
          task_type_id : data.task_type_id,
          job_type_id  : data.job_type_id,
          title        : data.title,
          description  : data.description,
          assigned_by  : data.assigned_by,
          location_id  : data.location_id,
          task_status  : TASK_STATUS.pending,
          start_date   : getCurrentDate(),
          end_date     : getScheduledTaskEndDate(
            data.scheduled_task_end_date_interval
          ),
          status    : TASK_STATUS.active,
          assignees : _taskAssigneesIds,
        };
        req.user = { user_id: data.created_by };
        const newTask = await addTask(req, taskRequest);
        const taskImages = await TaskImage.find({
          task_id: data.task_id,
        }).usingConnection(tenantConnection);
        await taskImageData(taskImages,newTask,req);
      }
    }
  }
  return true;
};

const _scheduledCron = async (curentTimeUTC) => {
  sails.log.debug('Task Scheduled Cron Execution Start');
  let sql = `
      SELECT
          account.account_id,
          account_configuration_detail.value,
          account_configuration_detail.code
        from account
        INNER JOIN
          account_configuration ON account.account_id = account_configuration.account_id
        INNER JOIN
          account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
        Where
          account_configuration_detail.code IN ($1,$2,$3,$4) and account.status = $5;`;

  const rawResult = await sails.sendNativeQuery(sql, [
    ACCOUNT_CONFIG_CODE.tenant_db_connection_string,
    ACCOUNT_CONFIG_CODE.time_zone,
    ACCOUNT_CONFIG_CODE.date_time_format,
    ACCOUNT_CONFIG_CODE.date_format,
    ACCOUNT_STATUS.active,
  ]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map((item) => item.account_id))];
  let accountArray = await accountArrayData(accountIds, results);

  for (const item of accountArray) {
    // Tenant specific database connection
    let connectionString = item.tenant_db_connection_string;
    let req = {};
    if (connectionString) {
      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let timezone = item.time_zone;
      let connectionString1 = item.tenant_db_connection_string;
      let tenantConnection = await mysql.createConnection(connectionString1);
      await tenantConnection.connect();
      req.dynamic_connection = tenantConnection;
      req.account = { account_id: item.account_id };
      let cronJob = await CronJob.findOne({
        code: CRON_JOB_CODE.task_scheduled,
      }).usingConnection(tenantConnection);

      if (cronJob) {
        let currentDate = curentTimeUTC;
        let obj;
        let start_date = await startDateDatas(cronJob);
        sails.log(start_date);
        try {
          // Update overdue task  status
          let taskSql = `SELECT * FROM task where is_scheduled = '1' and scheduled_end_date >= '${getDateTimezone(
            timezone
          )}';`;
          let _tasks = await sails
            .sendNativeQuery(taskSql)
            .usingConnection(tenantConnection);
          const taskrows = _tasks.rows;

          await taskRowsData(taskrows,req,tenantConnection);

          await sails
            .sendNativeQuery(
              `UPDATE task SET is_scheduled = 0 WHERE is_scheduled = 1 AND scheduled_end_date < CURDATE()`
            )
            .usingConnection(req.dynamic_connection);

          await CronJob.update(
            { code: CRON_JOB_CODE.task_scheduled },
            { last_processing_date: currentDate }
          ).usingConnection(tenantConnection);
          obj = {
            status : 'Success',
            error  : '',
          };
        } catch (error) {
          obj = {
            status : 'Failure',
            error  : `Error : ${error.message}`,
          };
          sails.log(obj);
        } finally {
          await CronJobLog.create({
            cron_job_id   : cronJob.cron_job_id,
            status        : obj.status,
            start_date    : currentDate,
            end_date      : getDateUTC(),
            error_message : obj.error,
          }).usingConnection(tenantConnection);
        }
      } else {
        // No Cron Jon with code Task Overdue
        sails.log('No Cron Jon with code Task Scheduled');
      }
      if (tenantConnection) {
        await tenantConnection.end();
      }
    }
  }

  sails.log.debug('Task Scheduled Cron Execution End');
};

const createdDateData = async (results, req) => {
  return results.created_date
    ? getDateSpecificTimeZone(
        results.created_date,
        req.timezone,
        req.dateFormat
    )
    : '';
};

const completedDateData = async (results, req) => {
  return results.last_updated_date
    ? getDateSpecificTimeZone(
        results.last_updated_date,
        req.timezone,
        req.dateFormat
    )
    : '';
};

const startDateData = async (results, req) => {
  return results.start_date
    ? formatDate(results.start_date, req.dateFormat)
    : '';
};

const endDateData = async (results, req) => {
  return results.end_date ? formatDate(results.end_date, req.dateFormat) : '';
};

const scheduledEndDate = async (results, req) => {
  return results.scheduled_end_date
    ? formatDate(results.scheduled_end_date, req.dateFormat)
    : '';
};

const jobTypAndLocationDetails = async (results, req) => {
  if (results.job_type_id && results.job_type_id !== null) {
    let jobType = await JobType.findOne({
      job_type_id: results.job_type_id,
    }).usingConnection(req.dynamic_connection);

    results.job_type = jobType
      ? {
        job_type_id : jobType.job_type_id,
        name        : jobType.name,
      }
      : null;
  }

  if (results.location_id && results.location_id !== null) {
    let locations = await Locations.findOne({
      location_id: results.location_id,
    }).usingConnection(req.dynamic_connection);

    results.location = locations
      ? {
        location_id : locations.location_id,
        name        : locations.name,
      }
      : null;
  }
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await TaskValidations.addEdit.validate(request);
      if (!isValidate.error) {
        const newlyAddedtask = await addTask(req, request);
        return res.ok(
          newlyAddedtask,
          messages.ADD_SUCCESS,
          RESPONSE_STATUS.success
        );
      } else {
        res.ok(isValidate.error, messages.ADD_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.SOMETHING_WENT_WRONG,
        RESPONSE_STATUS.error
      );
    }
  },
  edit: async (req, res) => {
    try {
      let request = req.allParams();
      if (req.params.id) {
        const taskId = req.params.id;
        const isValidPayload = await TaskValidations.addEdit.validate(request);
        if (!isValidPayload.error) {
          const checkTask = await Task.findOne({
            task_id: taskId,
          }).usingConnection(req.dynamic_connection);
          if (
            checkTask &&
            checkTask.task_id &&
            checkTask.task_status !== TASK_STATUS.completed
          ) {
            const {
              title,
              task_type_id,
              job_type_id,
              location_id,
              description,
              start_date,
              end_date,
              is_private,
              is_group_task,
              assignees,
              task_images,
              removed_task_image_ids,
              is_scheduled,
              scheduled_interval_in_days,
              scheduled_task_end_date_interval,
              scheduled_end_date,
            } = req.allParams();
            const empProfileDetails = await EmployeeProfile.findOne({
              user_id: req.user.user_id,
            }).usingConnection(req.dynamic_connection);
            sails.log(empProfileDetails);
            let task_status = TASK_STATUS.pending;
            let _end_date = moment(end_date);
            let current_date = moment(getCurrentDate());
            if (_end_date < current_date) {
              task_status = TASK_STATUS.overdue;
            }

            await Task.update(
              { task_id: taskId },
              {
                title,
                task_type_id,
                job_type_id : job_type_id > 0 ? job_type_id : null,
                location_id : location_id > 0 ? location_id : null,
                description,
                start_date,
                end_date,
                task_status,
                is_private  :
                  parseInt(is_private) === 0 || parseInt(is_private) === 1
                    ? parseInt(is_private)
                    : 0,
                is_group_task:
                  parseInt(is_group_task) === 0 || parseInt(is_group_task) === 1
                    ? parseInt(is_group_task)
                    : 0,
                // assigned_by       : empProfileDetails.employee_profile_id,
                is_scheduled:
                  parseInt(is_scheduled) === 0 || parseInt(is_scheduled) === 1
                    ? parseInt(is_scheduled)
                    : 0,
                scheduled_interval_in_days:
                  scheduled_interval_in_days !== '' &&
                  scheduled_interval_in_days !== null &&
                  scheduled_interval_in_days !== undefined
                    ? scheduled_interval_in_days
                    : 0,
                scheduled_task_end_date_interval:
                  scheduled_task_end_date_interval !== '' &&
                  scheduled_task_end_date_interval !== null &&
                  scheduled_task_end_date_interval !== undefined
                    ? scheduled_task_end_date_interval
                    : 0,
                scheduled_end_date:
                  scheduled_end_date !== '' &&
                  scheduled_end_date !== null &&
                  scheduled_end_date !== undefined
                    ? scheduled_end_date
                    : null,
                last_updated_by   : req.user.user_id,
                last_updated_date : getDateUTC(),
              }
            )
              .fetch()
              .usingConnection(req.dynamic_connection);
            if (task_images && task_images.length > 0) {
              const account = req.account;
              const taskImg = getImgUrl(task_images, account, taskId);
              // Move images to respective task directory on azure
              await copyImageFromTempToOri(
                taskImg.allUrl,
                account.account_guid,
                taskId,
                tmpUploadDirOnAzureForTask
              );
              // Create image entries in task_images table.
              const task_img_arr = taskImg.respImgArr.map((taskImgDetails) => {
                return {
                  task_id             : taskId,
                  image_url           : taskImgDetails.image_url,
                  image_thumbnail_url : taskImgDetails.image_thumbnail_url,
                  status              : TASK_STATUS.active,
                  created_by          : req.user.user_id,
                  last_updated_date   : getDateUTC(),
                  created_date        : getDateUTC(),
                };
              });
              if (task_img_arr.length > 0) {
                await TaskImage.createEach(task_img_arr).usingConnection(
                  req.dynamic_connection
                );
              }
            }
            const _taskAssigneeList = await TaskAssignee.find({
              task_id     : taskId,
              task_status : { '!=': TASK_STATUS.completed },
            }).usingConnection(req.dynamic_connection);
            const _taskAssigneesIds = _taskAssigneeList.map(
              (val) => val.assigned_to
            );

            let assigneesToAdd = assignees.filter(
              (x) => !_taskAssigneesIds.includes(x)
            );
            let assigneesToUpdate = _taskAssigneesIds.filter((x) =>
              assignees.includes(x)
            );
            let assigneesToDestroy = _taskAssigneesIds.filter(
              (x) => !assignees.includes(x)
            );

            const user = await Users.findOne({ user_id: req.user.user_id });
            if (assigneesToDestroy.length > 0) {
              const taskDelete = await getTaskAssigneeDetails(
                req,
                taskId,
                assigneesToDestroy
              );
              await TaskAssignee.destroy({
                task_id     : taskId,
                assigned_to : { in: assigneesToDestroy },
              }).usingConnection(req.dynamic_connection);
              // Below implmentation for sending notification to those assignee those details are deleted
              await sendNotification(req, {
                notification_entity : NOTIFICATION_ENTITIES.TASK_DELETION,
                assignees           : taskDelete,
                account_id          : req.account.account_id,
                employee_name       : `${user.first_name} ${user.last_name}`,
                task_title          : title,
                task_description    : description,
                start_date          : start_date
                  ? formatDate(start_date, req.dateFormat)
                  : '',
                end_date : end_date ? formatDate(end_date, req.dateFormat) : '',
                task_id  : taskId,
              });
            }
            if (assigneesToUpdate.length > 0) {
              await TaskAssignee.update(
                { task_id: taskId, assigned_to: { in: assigneesToUpdate } },
                { task_status }
              ).usingConnection(req.dynamic_connection);
              const taskUpdate = await getTaskAssigneeDetails(
                req,
                taskId,
                assigneesToUpdate
              );
              // Below implmentation for sending notification to those assignee those details are updated
              await sendNotification(req, {
                notification_entity : NOTIFICATION_ENTITIES.TASK_MODIFICATION,
                assignees           : taskUpdate,
                account_id          : req.account.account_id,
                employee_name       : `${user.first_name} ${user.last_name}`,
                task_title          : title,
                task_description    : description,
                start_date          : start_date
                  ? formatDate(start_date, req.dateFormat)
                  : '',
                end_date : end_date ? formatDate(end_date, req.dateFormat) : '',
                task_id  : taskId,
              });
            }
            const assignee_arr = assigneesToAdd.map((assignee_id) => {
              return {
                task_id           : taskId,
                assigned_to       : assignee_id,
                status            : TASK_STATUS.active,
                task_status       : task_status,
                created_by        : req.user.user_id,
                last_updated_by   : req.user.user_id,
                last_updated_date : getDateUTC(),
                created_date      : getDateUTC(),
              };
            });
            if (assignee_arr.length > 0) {
              await TaskAssignee.createEach(assignee_arr).usingConnection(
                req.dynamic_connection
              );
              const taskAdd = await getTaskAssigneeDetails(
                req,
                taskId,
                assigneesToAdd
              );

              // Below implmentation for sending notification to those assignee those details are created
              await sendNotification(req, {
                notification_entity : NOTIFICATION_ENTITIES.TASK_ASSIGNED,
                assignees           : taskAdd,
                account_id          : req.account.account_id,
                employee_name       : `${user.first_name} ${user.last_name}`,
                task_title          : title,
                task_description    : description,
                start_date          : start_date
                  ? formatDate(start_date, req.dateFormat)
                  : '',
                end_date   : end_date ? formatDate(end_date, req.dateFormat) : '',
                task_id    : taskId,
                attachment :
                  task_images && task_images.length > 0
                    ? task_images.join(',')
                    : '',
              });
            }
            if (removed_task_image_ids && removed_task_image_ids.length > 0) {
              await TaskImage.destroy({
                task_id       : taskId,
                task_image_id : { in: removed_task_image_ids },
              }).usingConnection(req.dynamic_connection);
            }
            const updatedTaskDetails = await getTaskDetails(req, taskId);
            // Below implmentation for sending notification to all the assignees
            let assignee_data = [] || any;
            updatedTaskDetails.pending_assignees.forEach((_assignee) => {
              if (
                assigneesToAdd &&
                assigneesToAdd.includes(_assignee.employee_profile_id)
              ) {
                assignee_data.push({
                  recipient_email                : _assignee.email,
                  recipient_first_name           : _assignee.first_name,
                  recipient_last_name            : _assignee.last_name,
                  recipient_phone                : _assignee.phone,
                  receipient_user_id             : _assignee.user_id,
                  receipient_employee_profile_id : _assignee.employee_profile_id,
                });
              }
            });
            return res.ok(
              updatedTaskDetails,
              messages.UPDATE_SUCCESS,
              RESPONSE_STATUS.success
            );
          } else {
            res.ok(undefined, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
          }
        } else {
          res.ok(
            isValidPayload.error,
            messages.UPDATE_FAILURE,
            RESPONSE_STATUS.error
          );
        }
      } else {
        res.ok(undefined, messages.PARAMETER_MISSING, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
    }
  },
  findById: async (req, res) => {
    try {
      let request = req.allParams();

      let permissions = req.permissions.map((perm) => perm.code);
      let idsSql = `Select assigned_to, created_by from task_assignee where task_id = ${req.params.id} and (task_assignee.assigned_to = ${req.empProfile.employee_profile_id} or task_assignee.created_by = ${req.user.user_id}) `;
      let idsSqlResult = await sails
        .sendNativeQuery(idsSql)
        .usingConnection(req.dynamic_connection);

      if (
        (idsSqlResult.rows && idsSqlResult.rows.length > 0) ||
        permissions.includes(TASK_PERMISSION.viewPrivateTask) ||
        permissions.includes(TASK_PERMISSION.viewEmployeePrivateTask) ||
        permissions.includes(TASK_PERMISSION.accessTaskHistory)
      ) {
        const isValidate = await TaskValidations.idParamValidation.validate(
          request
        );
        if (!isValidate.error) {
          const results = await getTaskDetails(req, req.params.id);
          if (results && results.task_id) {
            let completedresponse = results.completed_assignees.map((user) => {
              return {
                email               : user.email,
                employee_profile_id : user.employee_profile_id,
                first_name          : user.first_name,
                last_name           : user.last_name,
                name                : user.name,
                phone               : user.phone,
                task_status         : user.task_status,
                user_id             : user.user_id,
              };
            });

            let pendingresponse = results.pending_assignees.map((user1) => {
              return {
                email               : user1.email,
                employee_profile_id : user1.employee_profile_id,
                first_name          : user1.first_name,
                last_name           : user1.last_name,
                name                : user1.name,
                phone               : user1.phone,
                task_status         : user1.task_status,
                user_id             : user1.user_id,
              };
            });

            results.completed_assignees = completedresponse;
            results.pending_assignees = pendingresponse;
            results.created_date = await createdDateData(results, req);
            results.completed_date = await completedDateData(results, req);
            const taskType = await TaskType.findOne({
              task_type_id: results.task_type_id,
            }).usingConnection(req.dynamic_connection);
            results.task_type = {
              task_type_id : taskType.task_type_id,
              name         : taskType.name,
              is_default   : taskType.is_default,
            };
            await jobTypAndLocationDetails(results, req);
            results.start_date = await startDateData(results, req);
            results.end_date = await endDateData(results, req);
            results.scheduled_end_date = await scheduledEndDate(results, req);
            return res.ok(
              results,
              messages.GET_RECORD,
              RESPONSE_STATUS.success
            );
          } else {
            return res.ok(
              results,
              messages.DATA_NOT_FOUND,
              RESPONSE_STATUS.success
            );
          }
        } else {
          return res.ok(
            isValidate.error,
            messages.GET_RECORD,
            RESPONSE_STATUS.success
          );
        }
      } else {
        return res.ok(
          undefined,
          messages.ROLE_PERMISSION_REQUIRED,
          RESPONSE_STATUS.success
        );
      }
    } catch (err) {
      sails.log(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },
  findTaskImage: async (req, res) => {
    try {
      const result = await TaskImage.find({
        where: {
          task_id : req.params.id,
          status  : TASK_STATUS.active,
        },
      }).usingConnection(req.dynamic_connection);
      if (result.length > 0) {
        const response = result.map((item) => ({
          task_image_id       : item.task_image_id,
          task_id             : item.task_id,
          image_url           : item.image_url,
          image_thumbnail_url : item.image_thumbnail_url,
        }));
        return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(
          undefined,
          messages.NO_TASK_IMAGE,
          RESPONSE_STATUS.success
        );
      }
    } catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },
  findWithFilter: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await TaskValidations.filter.validate(request);
      let permissions = req.permissions.map((perm) => perm.code);
      if (
        req.empProfile.employee_profile_id.toString() ===
          request.id.toString() ||
        permissions.includes(TASK_PERMISSION.viewAllTasks) ||
        request.page === 'dashboard'
      ) {
        const employeeId = req.params.id;
        if (!isValidate.error) {
          if (request.assigned) {
            request = _.omit(request, 'assigned');
          }
          if (request.id) {
            request = _.omit(request, 'id');
          }
          const findQuery = await commonListing(request);
          const assigned = req.allParams().assigned;
          let sql = '';
          if (findQuery.andCondition.length > 0) {
            const andPayload = findQuery.andCondition;
            for (const data of andPayload) {
              Object.keys(data).forEach((prop) => {
                if (prop === 'location' && data[prop].length > 0) {
                  let locationPayload = data[prop];
                  const locationName = locationPayload
                    .map((c) => `'${c}'`)
                    .join(', ');
                  const locationId = '(' + locationName + ')';
                  sql = sql + `AND task.location_id IN ${locationId}`;
                }
                if (prop === 'task_status' && data[prop] !== '') {
                  if (`${data[prop]}` === 'Pending') {
                    sql =
                      sql +
                      ` AND (task.${prop} = '${data[prop]}' OR task.${prop} = 'Overdue')`;
                  } else {
                    sql = sql + ` AND task.${prop} = '${data[prop]}'`;
                  }
                }
                if (prop === 'task_type' && data[prop].length > 0) {
                  let taskPayload = data[prop];
                  const taskName = taskPayload.map((c) => `'${c}'`).join(', ');
                  const taskId = '(' + taskName + ')';
                  sql = sql + ` AND task.task_type_id IN ${taskId}`;
                }
                if (prop === 'assignee' && data[prop].length > 0) {
                  let assigneePayload = data[prop];
                  const assigneeName = assigneePayload
                    .map((c) => `'${c}'`)
                    .join(', ');
                  const assigneeId = '(' + assigneeName + ')';
                  sql = sql + ` AND task_assignee.assigned_to IN ${assigneeId}`;
                }
                if (prop === 'is_private' && data[prop] !== '') {
                  if (
                    data[prop] === 1 &&
                    permissions.includes(TASK_PERMISSION.viewPrivateTask)
                  ) {
                    sql = sql + ` AND task.${prop} = ${data[prop]}`;
                  }
                  if (
                    data[prop] === 1 &&
                    !permissions.includes(TASK_PERMISSION.viewPrivateTask)
                  ) {
                    sql =
                      sql +
                      ' AND ((task.is_private=1 AND task_assignee.assigned_to =' +
                      parseInt(employeeId) +
                      ') OR (task.is_private=1 AND task.created_by =' +
                      parseInt(req.user.user_id) +
                      ')) ';
                  }
                  if (data[prop] === 0) {
                    sql = sql + ` AND task.${prop} = 0`;
                  }
                } else if (prop === 'is_private' && data[prop] === '') {
                  if (!permissions.includes(TASK_PERMISSION.viewPrivateTask)) {
                    sql += ` AND (task.is_private = 0
                  OR ((task.is_private=1 AND task_assignee.assigned_to =${parseInt(
                    employeeId
  )}) OR (task.is_private=1 AND task.created_by =${parseInt(
                      req.user.user_id
)}))) `;
                  }
                }
                if (prop === 'end_date' && data[prop] !== '') {
                  const endDate = moment(data[prop]).format('YYYY-MM-DD');
                  sql = sql + ` AND date(task.${prop}) = '${endDate}'`;
                }
                if (prop === 'created_date') {
                  if (
                    data[prop].from_date !== '' &&
                    data[prop].to_date !== ''
                  ) {
                    const startDate = moment(data[prop].from_date)
                      .utc()
                      .format('YYYY-MM-DD');
                    const endDate = moment(data[prop].to_date)
                      .add(1, 'days')
                      .utc()
                      .format('YYYY-MM-DD');
                    sql =
                      sql +
                      ` AND (task.${prop} BETWEEN ('${startDate}') AND ('${endDate}'))`;
                  }
                }
                if (prop === 'all_location_data' && data[prop] !== '') {
                  if (`${data[prop]}` === 'no') {
                    sql = sql + ` AND task.location_id IS NULL`;
                  }
                }
                if (prop === 'all_task_status' && data[prop] !== '') {
                  if (`${data[prop]}` === 'Pending') {
                    sql = sql + ` AND (task.task_status = '${data[prop]}')`;
                  }
                }
              });
            }
          } else {
            if (
              !permissions.includes(TASK_PERMISSION.viewEmployeePrivateTask)
            ) {
              sql += ` AND (task.is_private = 0 OR ((task.is_private=1 AND task_assignee.assigned_to =${parseInt(
                employeeId
              )}) OR (task.is_private=1 AND task.created_by =${parseInt(
                req.user.user_id
              )}))) `;
            } else {
              if (!permissions.includes(TASK_PERMISSION.viewPrivateTask)) {
                sql += ` AND (task.is_private = 0
                 OR ((task.is_private=1 AND task_assignee.assigned_to =${parseInt(
                   employeeId
  )}) OR (task.is_private=1 AND task.created_by =${parseInt(
                  req.user.user_id
)}))) `;
              }
            }
          }
          let results;
          let andQuery = ' ';
          if (sql !== '') {
            andQuery = sql;
          }

          const rawResult = await sails
            .sendNativeQuery(
              'CALL TaskListHistory("' +
                parseInt(employeeId) +
                '","' +
                parseInt(assigned) +
                '", "' +
                parseInt(findQuery.rows) +
                '", "' +
                parseInt(findQuery.skip) +
                '", "' +
                andQuery +
                '") '
            )
            .usingConnection(req.dynamic_connection);
          results = rawResult.rows[0];
          if (results.length > 0) {
            const response = await results.map((item) => {
              let taskAssignees = [];
              let taskAssgineesStatus = [];
              let taskAssigneeTo = [];
              let assignedTask = [];
              if (item.task_assignee !== null) {
                const taskAssignee = item.task_assignee;
                assignedTask = taskAssignee.split(',');
                if (
                  parseInt(assigned) === 1 ||
                  parseInt(assigned) === 0 ||
                  parseInt(assigned) === 2 ||
                  parseInt(assigned) === 3
                ) {
                  {
                    for (let i of assignedTask) {
                      const assigTask = i.split('-');
                      taskAssignees.push(assigTask[0]);
                      taskAssgineesStatus.push(assigTask[1]);
                      taskAssigneeTo.push(assigTask[2]);
                    }
                  }
                }
              }
              return {
                task_id      : item.task_id,
                task_type    : item.task_type,
                title        : item.title,
                task_status  : item.task_status,
                description  : item.description,
                created_date : item.created_date
                  ? getDateSpecificTimeZone(
                      item.created_date,
                      req.timezone,
                      req.dateFormat
                  )
                  : '',
                last_updated_date: item.last_updated_date
                  ? getDateSpecificTimeZone(
                      item.last_updated_date,
                      req.timezone,
                      req.dateFormat
                  )
                  : '',
                location_name : item.location_name,
                is_private    : item.is_private,
                is_group_task : item.is_group_task,
                entity_type   : item.entity_type,
                entity_id     :
                  item.entity_id !== '' &&
                  item.entity_id !== null &&
                  item.entity_id !== undefined
                    ? item.entity_id
                    : 0,
                training_employee_id:
                  item.training_employee_id !== '' &&
                  item.training_employee_id !== null &&
                  item.training_employee_id !== undefined
                    ? item.training_employee_id
                    : 0,
                automated_task : item.automated_task,
                end_date       : item.end_date
                  ? formatDate(item.end_date, req.dateFormat)
                  : '',
                start_date: item.start_date
                  ? formatDate(item.start_date, req.dateFormat)
                  : '',
                profile_picture_url           : item.profile_picture_url,
                profile_picture_thumbnail_url :
                  item.profile_picture_thumbnail_url,
                created_by      : item.created_by,
                created_by_id   : item.created_by_id,
                last_updated_by : item.last_updated_by,
                task_assignee   : {
                  task_assignee        : taskAssignees.length > 0 ? taskAssignees : [],
                  task_assignee_status :
                    taskAssgineesStatus.length > 0 ? taskAssgineesStatus : [],
                  task_assignee_to:
                    taskAssigneeTo.length > 0 ? taskAssigneeTo : [],
                },
                task_assignee_status : item.task_assignee_status,
                images               : item.images,
              };
            });
            const totalCount = await sails
              .sendNativeQuery(
                'CALL TaskListCount("' +
                  parseInt(employeeId) +
                  '","' +
                  parseInt(assigned) +
                  '","' +
                  andQuery +
                  '") '
              )
              .usingConnection(req.dynamic_connection);
            const taskListCount = totalCount.rows[0][0].TaskCount;
            let data = {
              total_count : taskListCount,
              result      : response,
            };
            return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
          } else {
            return res.ok(
              undefined,
              messages.DATA_NOT_FOUND,
              RESPONSE_STATUS.success
            );
          }
        } else {
          res.ok(
            isValidate.error,
            messages.GET_DATA_FAILED,
            RESPONSE_STATUS.error
          );
        }
      } else {
        return res.ok(
          undefined,
          messages.ROLE_PERMISSION_REQUIRED,
          RESPONSE_STATUS.success
        );
      }
    } catch (error) {
      sails.log.error(error);

      return res.ok({}, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },
  getAssigneeByCreatorId: async function (req, res) {
    if (req.params.id) {
      let results;
      let sql = `SELECT EP.user_id, EP.employee_profile_id, CONCAT(user.first_name, ' ', user.last_name) as name
                FROM employee_profile EP
                JOIN user ON user.user_id = EP.user_id
                JOIN task_assignee TA ON TA.assigned_to = EP.employee_profile_id
                WHERE EP.status ='${ACCOUNT_STATUS.active}' AND TA.created_by = $1 GROUP BY TA.assigned_to`;
      const rawResult = await sails
        .sendNativeQuery(sql, [req.params.id])
        .usingConnection(req.dynamic_connection);
      results = rawResult.rows;
      return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);
    } else {
      return res.ok(
        undefined,
        messages.PARAMETER_MISSING,
        RESPONSE_STATUS.error
      );
    }
  },
  findAssignee: async function (req, res) {
    let params = req.allParams();
    if (params && params.empName) {
      let results;
      let whereCondition = ` WHERE (user.first_name LIKE '%${params.empName}%' OR user.last_name LIKE '%${params.empName}%') AND EP.status ='${ACCOUNT_STATUS.active}' AND user.password != '' `;
      let sql = `SELECT EP.user_id, EP.employee_profile_id, CONCAT(user.first_name, ' ', user.last_name) as name
                 FROM employee_profile EP`;
      if (params.location_id) {
        sql = ` ${sql} LEFT JOIN employee_location EL ON EP.employee_profile_id = EL.employee_profile_id 
                       LEFT JOIN location ON EL.location_id = location.location_id`;
        whereCondition = `${whereCondition} AND EL.location_id=${params.location_id}`;
      }

      if (params.job_type_id) {
        sql = ` ${sql} LEFT JOIN employee_job_type EJT ON EP.employee_profile_id = EJT.employee_profile_id 
                       LEFT JOIN job_type JT ON EJT.job_type_id = JT.job_type_id `;
        whereCondition = `${whereCondition} AND EJT.job_type_id=${params.job_type_id}`;
      }
      if (params.created_by) {
        whereCondition = `${whereCondition} AND EP.created_by=${params.created_by}`;
      }
      sql = ` ${sql} JOIN ${process.env.DB_NAME}.user ON user.user_id = EP.user_id ${whereCondition} GROUP BY EP.employee_profile_id`;
      const rawResult = await sails
        .sendNativeQuery(escapeSqlSearch(sql))
        .usingConnection(req.dynamic_connection);
      results = rawResult.rows;
      return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);
    } else {
      return res.ok(
        undefined,
        messages.PARAMETER_MISSING,
        RESPONSE_STATUS.error
      );
    }
  },
  findTaskAssignee: async function (req, res) {
    if (req.params.id) {
      let results;
      let sql = `SELECT EL.location_id, EJT.job_type_id,TA.task_status, EP.user_id, EP.employee_profile_id, CONCAT(user.first_name, ' ', user.last_name) as name
                 FROM employee_profile EP
                 LEFT JOIN employee_location EL ON EP.employee_profile_id = EL.employee_profile_id 
                 LEFT JOIN employee_job_type EJT ON EP.employee_profile_id = EJT.employee_profile_id 
                 JOIN ${process.env.DB_NAME}.user ON user.user_id = EP.user_id 
                 JOIN task_assignee TA ON TA.assigned_to=EP.employee_profile_id
                 WHERE TA.task_id=$1 AND EP.status =$2
                `;

      const rawResult = await sails
        .sendNativeQuery(sql, [req.params.id, ACCOUNT_STATUS.active])
        .usingConnection(req.dynamic_connection);
      results = rawResult.rows;

      const responseData = [];
      const tmpArr = [];
      results.forEach((data) => {
        if (tmpArr.includes(data.employee_profile_id)) {
          let obj = responseData.filter(
            (val) => val.employee_profile_id === data.employee_profile_id
          );
          obj[0].location_id = [...obj[0].location_id, data.location_id];
          obj[0].job_type_id = [...obj[0].job_type_id, data.job_type_id];
        } else {
          responseData.push({
            name                : data.name,
            user_id             : data.user_id,
            task_status         : data.task_status,
            employee_profile_id : data.employee_profile_id,
            location_id         : [data.location_id],
            job_type_id         : [data.job_type_id],
          });
          tmpArr.push(data.employee_profile_id);
        }
      });
      const respResults = {
        pending_assignees: responseData.filter(
          (val) =>
            val.task_status === TASK_STATUS.pending ||
            val.task_status === TASK_STATUS.overdue
        ),
        completed_assignees: responseData.filter(
          (val) => val.task_status === TASK_STATUS.completed
        ),
      };

      return res.ok(respResults, messages.GET_RECORD, RESPONSE_STATUS.success);
    } else {
      return res.ok(
        undefined,
        messages.PARAMETER_MISSING,
        RESPONSE_STATUS.error
      );
    }
  },
  taskExportToCSV: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await TaskValidations.export.validate(request);
      if (!isValidate.error) {
        if (request.assigned) {
          request = _.omit(request, 'assigned');
        }
        if (request.id) {
          request = _.omit(request, 'id');
        }
        const findQuery = await commonListing(request);
        const assigned = req.allParams().assigned;
        let sql = '';
        if (findQuery.andCondition.length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data of andPayload) {
            Object.keys(data).forEach((prop) => {
              if (prop === 'location' && data[prop].length > 0) {
                let locationPayload = data[prop];
                const locationName = locationPayload
                  .map((c) => `'${c}'`)
                  .join(', ');
                const locationId = '(' + locationName + ')';
                sql = sql + `AND task.location_id IN ${locationId}`;
              }
              if (prop === 'task_status' && data[prop] !== '') {
                if (`${data[prop]}` === 'Pending') {
                  sql =
                    sql +
                    ` AND (task.${prop} = '${data[prop]}' OR task.${prop} = 'Overdue')`;
                } else {
                  sql = sql + ` AND task.${prop} = '${data[prop]}'`;
                }
              }
              if (prop === 'task_type' && data[prop].length > 0) {
                let taskPayload = data[prop];
                const taskName = taskPayload.map((c) => `'${c}'`).join(', ');
                const taskId = '(' + taskName + ')';
                sql = sql + ` AND task.task_type_id IN ${taskId}`;
              }
              if (prop === 'assignee' && data[prop].length > 0) {
                let assigneePayload = data[prop];
                const assigneeName = assigneePayload
                  .map((c) => `'${c}'`)
                  .join(', ');
                const assigneeId = '(' + assigneeName + ')';
                sql = sql + ` AND task_assignee.assigned_to IN ${assigneeId}`;
              }
              if (prop === 'is_private' && data[prop] !== '') {
                sql = sql + ` AND task.${prop} = ${data[prop]}`;
              }
              if (prop === 'end_date' && data[prop] !== '') {
                const endDate = moment(data[prop]).format('YYYY-MM-DD');
                sql = sql + ` AND date(task.${prop}) = '${endDate}'`;
              }
              if (prop === 'created_date') {
                if (data[prop].from_date !== '' && data[prop].to_date !== '') {
                  const startDate = moment(data[prop].from_date)
                    .utc()
                    .format('YYYY-MM-DD');
                  const endDate = moment(data[prop].to_date)
                    .add(1, 'days')
                    .utc()
                    .format('YYYY-MM-DD');
                  sql =
                    sql +
                    ` AND (task.${prop} BETWEEN ('${startDate}') AND ('${endDate}'))`;
                }
              }
            });
          }
        }
        let results;
        let andQuery = ' ';
        if (sql !== '') {
          andQuery = sql;
        }
        const employeeId = req.params.id;
        const rawResult = await sails
          .sendNativeQuery(
            'CALL ExportTaskList("' +
              parseInt(employeeId) +
              '","' +
              parseInt(assigned) +
              '","' +
              andQuery +
              '") '
          )
          .usingConnection(req.dynamic_connection);
        results = rawResult.rows[0];

        if (results.length > 0) {
          let completedDate = '';
          let completedBy = '';
          const response = await results.map((item) => {
            if (item.completed_date) {
              completedDate =
                item.task_status === TASK_STATUS.overdue
                  ? ''
                  : getDateTimeSpecificTimeZone(
                      item.completed_date,
                      req.timezone,
                      req.dateTimeFormat
                  );
            } else {
              completedDate = '';
            }
            if (item.completed_by) {
              completedBy =
                item.task_status === TASK_STATUS.overdue
                  ? ''
                  : item.completed_by;
            } else {
              completedBy = '';
            }
            return {
              TaskID : item.task_id,
              Status :
                item.task_status === TASK_STATUS.overdue
                  ? TASK_STATUS.pending
                  : item.task_status,
              Title       : item.title,
              Description : item.description ? item.description : '',
              Type        : item.task_type,
              GroupTask   : item.is_group_task === 1 ? 'Yes' : 'No',
              Location    : item.location_name ? item.location_name : '',
              JobType     : item.job_type_name ? item.job_type_name : '',
              CreatedBy   : item.created_by,
              AssignedTo  : item.assignees,
              CreatedDate : item.created_date
                ? getDateTimeSpecificTimeZone(
                    item.created_date,
                    req.timezone,
                    req.dateTimeFormat
                )
                : '',
              AssignDate: moment
                .parseZone(item.start_date)
                .format('MM/DD/YYYY'),
              DueDate     : moment.parseZone(item.end_date).format('MM/DD/YYYY'),
              CompletedOn :
                item.task_status === TASK_STATUS.completed ? completedDate : '',
              CompletedBy:
                item.task_status === TASK_STATUS.completed ? completedBy : '',
              Images: item.task_images ? 'Yes' : 'No',
            };
          });
          const fileName =
            process.env.EXPORTED_FILE_NAME +
            moment().utc().format('MM-DD-YYYY_HH:mm:ss');
          const json2csv = new Parser();
          const csv = json2csv.parse(response);
          res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + fileName + '.csv'
          );
          res.set('Content-Type', 'text/csv');
          return res.status(200).send(csv);
        } else {
          return res.ok(
            undefined,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      } else {
        res.ok(
          isValidate.error,
          messages.GET_DATA_FAILED,
          RESPONSE_STATUS.error
        );
      }
    } catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  deleteTask: async function (req, res) {
    let request = req.allParams();
    const isValidate = await TaskValidations.idParamValidation.validate(
      request
    );
    if (!isValidate.error) {
      const taskId = req.params.id;
      const taskDetails = await Task.findOne({
        task_id: taskId,
      }).usingConnection(req.dynamic_connection);
      const taskAssigneeDetails = await TaskAssignee.find({
        task_id: taskId,
      }).usingConnection(req.dynamic_connection);
      const t = taskAssigneeDetails.filter(
        (assignee) => assignee.task_status === TASK_STATUS.completed
      );
      if (
        taskDetails &&
        taskDetails.status !== TASK_STATUS.completed &&
        taskAssigneeDetails &&
        !t.length > 0
      ) {
        let assigneesToDestroy = [];
        await taskAssigneeDetails.map((item) => {
          assigneesToDestroy.push(item.assigned_to);
        });
        const taskDelete = await getTaskAssigneeDetails(
          req,
          taskId,
          assigneesToDestroy
        );

        await Task.update(
          { task_id: taskId },
          { status: TASK_STATUS.inactive }
        ).usingConnection(req.dynamic_connection);
        await TaskAssignee.update(
          { task_id: taskId },
          { status: TASK_STATUS.inactive }
        ).usingConnection(req.dynamic_connection);
        await TaskImage.update(
          { task_id: taskId },
          { status: TASK_STATUS.inactive }
        ).usingConnection(req.dynamic_connection);
        // Below implmentation for sending notification to those assignee those details are deleted
        const user = await Users.findOne({ user_id: req.user.user_id });
        await sendNotification(req, {
          notification_entity : NOTIFICATION_ENTITIES.TASK_DELETION,
          assignees           : taskDelete,
          account_id          : req.account.account_id,
          employee_name       : `${user.first_name} ${user.last_name}`,
          task_title          : taskDetails.title,
          task_description    : taskDetails.description,
          start_date          : taskDetails.start_date
            ? formatDate(taskDetails.start_date, req.dateFormat)
            : '',
          end_date: taskDetails.end_date
            ? formatDate(taskDetails.end_date, req.dateFormat)
            : '',
          task_id: taskId,
        });
        return res.ok(
          undefined,
          messages.DELETE_SUCCESS,
          RESPONSE_STATUS.success
        );
      } else {
        return res.ok(
          undefined,
          messages.DELETE_INCOMPLETE,
          RESPONSE_STATUS.warning
        );
      }
    } else {
      return res.ok(
        undefined,
        messages.INVALID_PARAMETER,
        RESPONSE_STATUS.error
      );
    }
  },

  deleteMultipleTask: async function (req, res) {
    let request = req.allParams();
    const isValidate = await TaskValidations.deleteMultipleTask.validate(
      request
    );
    if (!isValidate.error) {
      const { id } = request;
      if (id && id.length > 0) {
        for (const index in id) {
          let taskId = id[index];
          const taskDetails = await Task.findOne({
            task_id: taskId,
          }).usingConnection(req.dynamic_connection);
          const taskAssigneeDetails = await TaskAssignee.find({
            task_id: taskId,
          }).usingConnection(req.dynamic_connection);
          const t = taskAssigneeDetails.filter(
            (assignee) => assignee.task_status === TASK_STATUS.completed
          );
          if (
            taskDetails &&
            taskDetails.status !== TASK_STATUS.completed &&
            taskAssigneeDetails &&
            !t.length > 0
          ) {
            let assigneesToDestroy = [];
            await taskAssigneeDetails.map((item) => {
              assigneesToDestroy.push(item.assigned_to);
            });
            const taskDelete = await getTaskAssigneeDetails(
              req,
              taskId,
              assigneesToDestroy
            );
            await Task.update(
              { task_id: taskId },
              { status: TASK_STATUS.inactive }
            ).usingConnection(req.dynamic_connection);
            await TaskAssignee.update(
              { task_id: taskId },
              { status: TASK_STATUS.inactive }
            ).usingConnection(req.dynamic_connection);
            await TaskImage.update(
              { task_id: taskId },
              { status: TASK_STATUS.inactive }
            ).usingConnection(req.dynamic_connection);
            // Below implmentation for sending notification to those assignee those details are deleted
            const user = await Users.findOne({ user_id: req.user.user_id });
            await sendNotification(req, {
              notification_entity : NOTIFICATION_ENTITIES.TASK_DELETION,
              assignees           : taskDelete,
              account_id          : req.account.account_id,
              employee_name       : `${user.first_name} ${user.last_name}`,
              task_title          : taskDetails.title,
              task_description    : taskDetails.description,
              start_date          : await taskStartDate(taskDetails, req),
              end_date            : await taskEndDate(taskDetails, req),
              task_id             : taskId,
            });
          }
        }
        return res.ok(
          undefined,
          messages.DELETE_SUCCESS,
          RESPONSE_STATUS.success
        );
      }
      return res.ok(
        undefined,
        messages.DELETE_SUCCESS,
        RESPONSE_STATUS.success
      );
    } else {
      return res.ok(
        undefined,
        messages.INVALID_PARAMETER,
        RESPONSE_STATUS.error
      );
    }
  },

  deleteTaskForAssignee: async function (req, res) {
    let request = req.allParams();
    const isValidate = await TaskValidations.deleteValidation.validate(request);
    if (!isValidate.error) {
      const { task_id, employee_profile_id } = req.allParams();
      const taskDetails = await Task.findOne({
        task_id: task_id,
      }).usingConnection(req.dynamic_connection);
      if (taskDetails && taskDetails.status !== TASK_STATUS.completed) {
        let isGroupTask = taskDetails.is_group_task;
        const assigneesToDestroy = [];
        assigneesToDestroy.push(employee_profile_id);
        const taskDelete = await getTaskAssigneeDetails(
          req,
          task_id,
          assigneesToDestroy,
          isGroupTask
        );
        if (isGroupTask === false) {
          await TaskAssignee.update(
            { task_id: task_id, assigned_to: employee_profile_id },
            { status: TASK_STATUS.inactive }
          ).usingConnection(req.dynamic_connection);
          const taskStatusDetails = await TaskAssignee.find({
            task_id : task_id,
            status  : TASK_STATUS.active,
          }).usingConnection(req.dynamic_connection);
          if (taskStatusDetails && taskStatusDetails.length === 0) {
            await Task.update(
              { task_id: task_id },
              { status: TASK_STATUS.inactive }
            ).usingConnection(req.dynamic_connection);
          }
        } else {
          await TaskAssignee.update(
            { task_id: task_id },
            { status: TASK_STATUS.inactive }
          ).usingConnection(req.dynamic_connection);
          await Task.update(
            { task_id: task_id },
            { status: TASK_STATUS.inactive }
          ).usingConnection(req.dynamic_connection);
        }
        // Below implmentation for sending notification to those assignee those details are deleted
        const user = await Users.findOne({ user_id: req.user.user_id });
        await sendNotification(req, {
          notification_entity : NOTIFICATION_ENTITIES.TASK_DELETION,
          assignees           : taskDelete,
          account_id          : req.account.account_id,
          employee_name       : `${user.first_name} ${user.last_name}`,
          task_title          : taskDetails.title,
          task_description    : taskDetails.description,
          start_date          : await taskStartDate(taskDetails, req),
          end_date            : await taskEndDate(taskDetails, req),
          task_id             : task_id,
        });
        return res.ok(
          undefined,
          messages.DELETE_SUCCESS,
          RESPONSE_STATUS.success
        );
      } else {
        return res.ok(undefined, messages.DELETE_FAIL, RESPONSE_STATUS.error);
      }
    } else {
      return res.ok(
        isValidate.error,
        messages.INVALID_PARAMETER,
        RESPONSE_STATUS.error
      );
    }
  },
  updateTaskStatus: async function (req, res) {
    let request = req.allParams();
    const isValidate =
      await TaskValidations.updateTaskStatusValidation.validate(request);
    if (!isValidate.error) {
      const { task_id, employee_profile_id } = req.allParams();
      const taskDetails = await Task.findOne({
        task_id: task_id,
      }).usingConnection(req.dynamic_connection);
      if (taskDetails && taskDetails.status !== TASK_STATUS.completed) {
        let user = await Users.findOne({ user_id: req.user.user_id });

        if (taskDetails.is_group_task === false) {
          const tasktype = await TaskType.findOne({
            task_type_id: taskDetails.task_type_id,
          }).usingConnection(req.dynamic_connection);
          if (
            tasktype.name === DEFAULT_TASK_TYPE.REVIEW_CERTIFICATE ||
            tasktype.name === DEFAULT_TASK_TYPE.ASSIGN_CERTIFICATE
          ) {
            await TaskAssignee.update(
              { task_id: task_id },
              {
                task_status       : TASK_STATUS.completed,
                last_updated_by   : req.user.user_id,
                last_updated_date : getDateUTC(),
              }
            )
              .fetch()
              .usingConnection(req.dynamic_connection);
          } else {
            await TaskAssignee.update(
              { task_id: task_id, assigned_to: { in: employee_profile_id } },
              {
                task_status       : TASK_STATUS.completed,
                last_updated_by   : req.user.user_id,
                last_updated_date : getDateUTC(),
              }
            )
              .fetch()
              .usingConnection(req.dynamic_connection);
          }

          const taskStatusDetails = await TaskAssignee.find({
            task_id     : task_id,
            task_status : { '!=': TASK_STATUS.completed },
            status      : ACCOUNT_STATUS.active,
          }).usingConnection(req.dynamic_connection);
          if (taskStatusDetails) {
            if (taskStatusDetails.length === 0) {
              await Task.update(
                { task_id: task_id },
                {
                  task_status       : TASK_STATUS.completed,
                  last_updated_by   : req.user.user_id,
                  last_updated_date : getDateUTC(),
                }
              ).usingConnection(req.dynamic_connection);
            } else {
              const pendingAssignees = [];
              const _taskdetails = await getTaskDetails(req, task_id);
              if (_taskdetails && _taskdetails.pending_assignees.length > 0) {
                _taskdetails.pending_assignees.forEach((val) => {
                  if (val.profile_status === ACCOUNT_STATUS.inactive) {
                    pendingAssignees.push(val);
                  }
                });
                if (pendingAssignees.length === taskStatusDetails.length) {
                  await Task.update(
                    { task_id: task_id },
                    {
                      task_status       : TASK_STATUS.completed,
                      last_updated_by   : req.user.user_id,
                      last_updated_date : getDateUTC(),
                    }
                  ).usingConnection(req.dynamic_connection);
                }
              }
            }
          }

          const _task = await getTaskDetails(req, task_id);
          // Below implmentation for sending notification to the assignee whose task is completed
          if (
            _task.completed_assignees &&
            _task.completed_assignees.length > 0
          ) {
            await sendNotification(req, {
              notification_entity : NOTIFICATION_ENTITIES.TASK_COMPLETED,
              receipient_user_id  :
                _task.completed_assignees[0].created_by_user_id,
              recipient_email      : _task.completed_assignees[0].created_by_email,
              recipient_first_name :
                _task.completed_assignees[0].created_by_fname,
              recipient_last_name:
                _task.completed_assignees[0].created_by_lname,
              receipient_employee_profile_id:
                _task.completed_assignees[0].created_by_employee_profile_id,
              employee_name    : `${user.first_name} ${user.last_name}`,
              account_id       : req.account.account_id,
              task_title       : _task.title,
              task_description : _task.description,
              start_date       : _task.start_date
                ? formatDate(_task.start_date, req.dateFormat)
                : '',
              end_date: _task.end_date
                ? formatDate(_task.end_date, req.dateFormat)
                : '',
              task_id         : task_id,
              completion_date : getDateSpecificTimeZone(
                getDateUTC(),
                req.timezone,
                req.dateFormat
              ),
            });
          }
        } else {
          await TaskAssignee.update(
            { task_id: task_id },
            {
              task_status       : TASK_STATUS.completed,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC(),
            }
          )
            .fetch()
            .usingConnection(req.dynamic_connection);
          await Task.update(
            { task_id: task_id },
            {
              task_status       : TASK_STATUS.completed,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC(),
            }
          ).usingConnection(req.dynamic_connection);
          const allTaskAssignee = await getTaskAssigneeDetails(
            req,
            task_id,
            0,
            true
          );
          const taskCreaterId = taskDetails.assigned_by;
          // Checking if task is created by is exists in task assignee table
          const isTaskCreaterIsAssignee = !!allTaskAssignee.find(
            (taskAssignee) => {
              return (
                taskAssignee.receipient_employee_profile_id === taskCreaterId
              );
            }
          );

          let allAssignee = [];
          if (isTaskCreaterIsAssignee === false) {
            let getAssignerDetail = await getTaskAssignerDetails(req, task_id);
            //sails.log('get all assignee', getAssignerDetail);
            // If assignner id is not in assignee then push it to in assginee array.
            allAssignee = [...allTaskAssignee, ...getAssignerDetail];
          } else {
            allAssignee = allTaskAssignee;
          }

          const _gtask = await getTaskDetails(req, task_id);
          for (const item of allAssignee) {
            await sendNotification(req, {
              notification_entity            : NOTIFICATION_ENTITIES.GROUP_TASK_COMPLETED,
              receipient_user_id             : item.receipient_user_id,
              recipient_email                : item.recipient_email,
              recipient_first_name           : item.recipient_first_name,
              recipient_last_name            : item.recipient_last_name,
              receipient_employee_profile_id :
                item.receipient_employee_profile_id,
              employee_name    : `${user.first_name} ${user.last_name}`,
              created_user_id  : taskDetails.created_by,
              account_id       : req.account.account_id,
              task_title       : _gtask.title,
              task_description : _gtask.description,
              start_date       : _gtask.start_date
                ? formatDate(_gtask.start_date, req.dateFormat)
                : '',
              end_date: _gtask.end_date
                ? formatDate(_gtask.end_date, req.dateFormat)
                : '',
              task_id         : task_id,
              completion_date : getDateSpecificTimeZone(
                getDateUTC(),
                req.timezone,
                req.dateFormat
              ),
            });
          }
        }

        if (taskDetails.entity_id !== 0) {
          return res.ok(
            undefined,
            messages.SKILL_REASSESSED_COMPLETED,
            RESPONSE_STATUS.success
          );
        } else {
          return res.ok(
            undefined,
            messages.TASK_COMPLETED,
            RESPONSE_STATUS.success
          );
        }
      } else {
        return res.ok(
          undefined,
          messages.TASK_UPDATE_FAILED,
          RESPONSE_STATUS.error
        );
      }
    } else {
      return res.ok(
        isValidate.error,
        messages.INVALID_PARAMETER,
        RESPONSE_STATUS.error
      );
    }
  },
  getPendingTaskCount: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await TaskValidations.idParamValidation.validate(
        request
      );
      if (!isValidate.error) {
        let empId = req.params.id;
        const pendingTask = `SELECT COUNT(1) AS total_count FROM task_assignee WHERE assigned_to = ${empId} AND task_status != 'Completed' AND status = 'Active'`;
        const taskTypeRow = await sails
          .sendNativeQuery(pendingTask)
          .usingConnection(req.dynamic_connection);
        const typeResult = taskTypeRow.rows[0] || null;
        if (typeResult) {
          return res.ok(
            { total_count: typeResult.total_count },
            messages.GET_RECORD,
            RESPONSE_STATUS.success
          );
        } else {
          return res.ok(
            undefined,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      } else {
        return res.ok(
          isValidate.error,
          messages.GET_RECORD,
          RESPONSE_STATUS.success
        );
      }
    } catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },
  onverdueReminderCron : _onverdueReminderCron,
  trigger              : async (_req, res) => {
    let curentTimeUTC = getDateUTC();
    await _onverdueReminderCron(curentTimeUTC, false);
    return res.ok(undefined, 'Triggered SuccessFully', RESPONSE_STATUS.success);
  },
  scheduledCron    : _scheduledCron,
  scheduledTrigger : async (_req, res) => {
    let curentTimeUTC = getDateUTC();
    await _scheduledCron(curentTimeUTC);
    return res.ok(
      undefined,
      'Triggered Task Scheduled SuccessFully',
      RESPONSE_STATUS.success
    );
  },
  addMultiSkillTask: async function (req, res) {
    try {
      const account = req.account.account_id;
      const due_day = await dueDays(account);

      let request = req.allParams();
      const groupActivityId = parseInt(request.groupActivityId);
      const taskTypeQuery = `SELECT task_type_id FROM task_type where name = 'Retest Skill'`;
      const taskTypeRow = await sails
        .sendNativeQuery(taskTypeQuery)
        .usingConnection(req.dynamic_connection);
      const typeResult = taskTypeRow.rows[0] || null;
      const retest_task_type_id = typeResult.task_type_id;

      let results = '';
      let sql = `SELECT training_employee_id, training_id, employee_profile_id FROM training_employee WHERE grade_id = '3' AND group_activity_id = ${groupActivityId}`;
      const rawResult = await sails
        .sendNativeQuery(escapeSqlSearch(sql))
        .usingConnection(req.dynamic_connection);
      results = rawResult.rows;

      let taskRequest = {};
      for (const [value] of Object.entries(results)) {
        const trainings = `SELECT name FROM training where training_id = ${value.training_id}`;
        const rawTResult = await sails
          .sendNativeQuery(trainings)
          .usingConnection(req.dynamic_connection);
        const trainingResult = rawTResult.rows[0] || null;
        const training_title = trainingResult.name;

        taskRequest = {
          title                : `Review Skill - ${training_title}`,
          task_type_id         : retest_task_type_id,
          description          : 'Review Skill',
          start_date           : getCurrentDate(),
          end_date             : getAutomatedTaskDueDate(due_day),
          is_private           : 1,
          is_group_task        : 0,
          entity_type          : AUTOMATED_TASK_ENTITY_TYPE.TRAINING,
          entity_id            : value.training_id,
          assignees            : [value.employee_profile_id],
          training_employee_id : value.training_employee_id,
          multiskilltask       : true,
        };

        await addTask(req, taskRequest);
      }
      return res.ok(
        undefined,
        'Multi skill automated task added successfully',
        RESPONSE_STATUS.success
      );
    } catch (error) {
      sails.log.error(error);
      return res.ok(
        undefined,
        messages.SOMETHING_WENT_WRONG,
        RESPONSE_STATUS.error
      );
    }
  },

  uploadTaskImages: async (req,res) => {
    try{
      let request = req.allParams();
      const isValidate = await TaskValidations.uploadTaskImages.validate(request);
      if(!isValidate.error) {
        let { task_id } = request;
        let upload = req.file('images');
        if(upload._files.length !== 0 ){

          let availableTaskImages = await TaskImage.find({
            where  : {task_id: task_id},
            select : ['task_image_id']
          }).usingConnection(req.dynamic_connection);

          let allowedUploadCount = validations.ALLOWED_TASK_IMAGE_COUNT;
          if(availableTaskImages.length > 0){
            allowedUploadCount = allowedUploadCount - availableTaskImages.length;
            if(allowedUploadCount <= 0){
              throw new Error(messages.MAX_FILE_LIMIT_EXCEEDED);
            }
          }
          const account = req.account;
          let containerName = account.account_guid;
          let dirName = `${uploadDirOnAzureForTask}/${task_id}`;
          let data = {
            invalidFileTypeMsg : messages.INVALID_TASK_IMAGE_TYPE,
            maxUploadFileCount : allowedUploadCount,
            maxUploadSize      : 5,
            fileAllowedTypes   : validations.ALLOWED_IMAGES,
            isThumbnail        : true
          };
          let fileUID = await uploadDocument(upload, containerName, dirName, data);
          if (fileUID && fileUID.length > 0) {
            const account = req.account;
            const taskImg = getImgUrl(fileUID, account, task_id);

            const task_img_arr = taskImg.respImgArr.map((taskImgDetails) => {
              return {
                task_id             : task_id,
                image_url           : taskImgDetails.image_url,
                image_thumbnail_url : taskImgDetails.image_thumbnail_url,
                status              : TASK_STATUS.active,
                created_by          : req.user.user_id,
                last_updated_date   : getDateUTC(),
                created_date        : getDateUTC(),
              };
            });

            if (task_img_arr.length > 0) {
              await TaskImage.createEach(task_img_arr).usingConnection(
                req.dynamic_connection
              );
            }
            return res.ok(
              undefined,
              messages.TASK_IMAGE_UPLOAD_SUCCESS,
              RESPONSE_STATUS.success
            );
          }else{
            return res.ok(undefined,messages.TASK_IMAGE_UPLOAD_FAILURE,RESPONSE_STATUS.error);
          }
        }else{
          return res.ok(undefined,messages.TASK_IMAGE_NOT_SELECTED,RESPONSE_STATUS.error);
        }
      }else{
        return res.ok(isValidate.error,messages.TASK_IMAGE_UPLOAD_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,error.message,RESPONSE_STATUS.error);
    }
  },
};
