const axios = require("axios");
const graylog2 = require("graylog2");

async function request(url, sessionId, cmd) {
  let multiCmd = false;
  let data = {
    auth: {
      sessionId
    },
    cmd
  };
  if (Object.keys(cmd).indexOf("command") === -1) {
    delete data.cmd;
    const newDataObj = { ...data, ...cmd };
    multiCmd = true;

    data = newDataObj;
  }

  try {
    const d = await axios({
      method: "POST",
      url,
      data
    });
    if (!multiCmd && typeof d.data.cmd !== "undefined") {
      return d.data.cmd;
    } else if (multiCmd) {
      return d.data;
    }
    return d.data;
  } catch (e) {
    return e.toJSON();
  }
};

function permission(sessionInfo, level) {
  if (level == "super") {
    return sessionInfo.params.hasSuperAdmin || sessionInfo.params.hasSuperOps;
  } else if (level === "orgadmin") {
    return (
      sessionInfo.params.hasOrgAdmin ||
      sessionInfo.params.hasSuperAdmin ||
      sessionInfo.params.hasSuperOps
    );
  }
};

async function addLog(message, success, facility, info) {
  const response = {
    message,
    success: success,
  };
  const logger = new graylog2.graylog({
    servers: [
      { host: process.env.GRAYLOG_HOST, port: process.env.GRAYLOG_PORT },
    ],
    hostname: process.env.GRAYLOG_SOURCE,
    facility,
  });
  const additionalFields = {
    application_name: process.env.APPLICATION_NAME,
    source: process.env.SERVER,
    has_failure: success,
    org_key: "none",
    who_am_i: "SYSTEM",
    session_id: "none",
    dwopen_server_id: "none",
  };
  if (typeof info !== "undefined" && Object.keys(info).length > 0) {
    additionalFields["org_key"] = info._session["orgKey"];
    additionalFields["who_am_i"] = info._session["whoAmI"];
    additionalFields["session_id"] = info._session["id"];
    additionalFields["dwopen_server_id"] = info._session["serverId"];
  }
  if (process.env.DEBUG === "1") {
    console.log(`logUtil.ts: ${JSON.stringify(response)}`);
  }
  try {
    if (success) {
      logger.log(response, response, additionalFields);
    } else {
      logger.error(response, response, additionalFields);
    }

    logger.on("error", function (error) {
      console.error("Error while trying to write to graylog2:", error);
    });
  } catch (e) {
    console.error(e);
  }
  return response;
}

module.exports.request = request;
module.exports.permission = permission;
module.exports.addLog = addLog;