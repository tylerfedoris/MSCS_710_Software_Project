const axios = require("axios");

// Require and initialize outside of your main handler
const mysql = require("serverless-mysql")({
  config: {
    host: process.env.ENDPOINT,
    user: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.PRIMARY_DB_NAME,
  },
});

// Main handler function
exports.handler = async (event) => {
  var validated = false;
  var test = "false";
  // Initialize response object
  var response = {
    success: false,
    data: [],
    headers: {
      "X-Requested-With": "*",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    },
  };
  var user_id = "";

  await axios
    .post(
      "https://ytp3g6j58c.execute-api.us-east-2.amazonaws.com/test/get-registration-info",
      {
        registration_id: event.registration_id,
      }
    )
    .then(
      (result) => {
        if (result.data.success) {
          validated = true;
          user_id = result.data.data.user_id;
        }
      },
      (error) => {
        console.log(error);
      }
    );

  console.log(test);

  if (!validated || user_id === "") return response;

  // Set query string
  const query =
    "SELECT A.entry_time, machine_name, system_name, version, machine_type, brand, hz_actual, core_count, memory_total " +
    "FROM cpu_metrics AS A " +
    "LEFT JOIN memory_metrics USING(machine_id) " +
    "LEFT JOIN client_machine USING(machine_id) " +
    "LEFT JOIN map_user_machine USING(machine_id) " +
    "WHERE user_id = ? AND machine_id = ? " +
    "UNION " +
    "SELECT A.entry_time, machine_name, system_name, version, machine_type, brand, hz_actual, core_count, memory_total " +
    "FROM cpu_metrics AS A " +
    "RIGHT JOIN memory_metrics USING(machine_id) " +
    "RIGHT JOIN client_machine USING(machine_id) " +
    "RIGHT JOIN map_user_machine USING(machine_id) " +
    "WHERE user_id = ? AND machine_id = ? ";

  // Run your query
  let results = await mysql.query(query, [
    user_id,
    event.machine_id,
    user_id,
    event.machine_id,
  ]);
  response.success = results.length > 0 ? true : false;
  response.data = results.length > 0 ? results : {};

  // Run clean up function
  await mysql.end();

  // Return the results
  return response;
};
