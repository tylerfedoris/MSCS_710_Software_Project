import os
import requests
from json import loads


def store_local(collector, csv_path):
    """
    This function store the data frame in the collector on the given csv path
    :param collector: Collector object with the data frame to store
    :param csv_path: Full path of the csv file to store the data frame
    :return:
    """
    if collector.to_stored:
        metric_df = collector.get_metrics_df()
        if os.path.exists(csv_path):
            metric_df.to_csv(csv_path, mode="a", header=False, index=False, index_label=False)
        else:
            metric_df.to_csv(csv_path, index=False, index_label=False)
        collector.to_stored = False
    else:
        collector.logger.info("Skipping collect " + type(collector).__name__)


def store_to_database(collector, reg_id):
    """
    This function store the data frame in the collector onto remote database with given registration id that
    authenticate the user.
    :param collector: Collector object with the data frame to store
    :param reg_id: Registration id associate with the user account
    :return:
    """
    if collector.to_stored and collector.remote_url != "":
        metrics_df = collector.get_metrics_df()
        metrics_df["registration_id"] = reg_id
        post_data = loads(metrics_df.to_json(orient="records"))
        for json in post_data:
            response = requests.post(collector.remote_url, json=json)
            if response is not None and response.status_code == 200:
                collector.logger.info("Stored " + type(collector).__name__ + " successfully")
            else:
                collector.logger.error("Fail to store " + type(collector).__name__)
                collector.logger.error("Attempt storing metrics data again")
                response = requests.post(collector.remote_url, json=json)
                if response is not None and response.status_code == 200:
                    collector.logger.error("Fail to store " + type(collector).__name__)
    else:
        collector.logger.info("Skipping collector " + type(collector).__name__)


def register_machine(reg_url, reg_id, machine_id, datetime):
    """
    This function post a record that associated the user account with the host machine
    :param reg_url: URL of the API to register the record that map the user and the host machine
    :param reg_id: Registration id that represents the user
    :param machine_id: Machine id of the host machine
    :param datetime: datetime of the record
    :return:
    """
    data_json = {
        "registration_id": reg_id,
        "machine_id": machine_id,
        "last_updated_time": datetime
    }
    response = requests.post(reg_url, json=data_json)
    return response
