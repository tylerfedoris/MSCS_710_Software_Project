import unittest
import pandas as pd
import os
from requests import Response
from computerMetricCollector.metricsCollector.StorageAPI import store_to_database
from computerMetricCollector.crypto import encrypt_data
from computerMetricCollector.test.crypto import read_key, decrypt_data
from computerMetricCollector.config import import_config
from computerMetricCollector.metricsCollector.computerMetrics import get_computer_id
from computerMetricCollector.metricsCollector.cpuMetrics import CPUMetrics
from computerMetricCollector.test.TestCase.LoggerTest import set_logger


class CPUTest(unittest.TestCase):
    def setUp(self):
        self.logger = set_logger("DEBUG")
        self.root_dir = os.path.dirname(os.path.dirname(__file__))
        self.settings = import_config(self.root_dir)
        self.date_format = self.settings.get("date_time_format")
        self.meta = self.settings.get("collectors").get("CPUMetrics")
        self.collector = CPUMetrics(self.logger, get_computer_id(self.logger), self.meta.get("metrics"),
                                   self.meta.get("metrics_to_encrypt"), self.date_format, self.meta.get("url"))
        self.collector.fetch_metrics()
        self.metrics_df = self.collector.get_metrics_df()
        self.sample_df = pd.read_csv(self.root_dir + "/sample_data/CPUMetrics.csv",
                                     names=self.meta.get("metrics"))

    def test_cpu(self):
        if len(self.meta.get("metrics_to_match")) > 0:
            match_metrics_df = self.metrics_df.filter(items=self.meta.get("metrics_to_match"), axis=1)
            match_sample_df = self.sample_df.filter(items=self.meta.get("metrics_to_match"), axis=1)
            pd.testing.assert_frame_equal(match_metrics_df, match_sample_df, check_dtype=False)
        else:
            self.logger.warning("No match test for cpu data")

    def test_metrics_type(self):
        for idx, rec in self.metrics_df.iterrows():
            self.assertRegex(rec["Brand"], r"^[a-zA-Z0-9-()#@. ]*$")
            self.assertRegex(rec["Vendor"], r"^[a-zA-Z0-9-_ ]*$")
            self.assertRegex(rec["Arch"], r"^[a-zA-Z0-9_]*$")
            self.assertGreater(rec["Bits"], 0)
            self.assertGreater(rec["HZAdvertise"], 0)
            self.assertGreater(rec["HZActual"], 0)
            self.assertGreater(rec["Count"], 0)

    def test_encryption(self):
        raw_metrics_df = self.metrics_df
        encrypt_key = read_key(self.root_dir + self.settings.get("encryption_key_file"))
        encrypt_data(self.collector, encrypt_key)
        encrypted_metrics_df = self.collector.get_metrics_df()
        decrypt_key = read_key(self.root_dir + self.settings.get("decryption_key_file"))
        decrypted_metrics_df = decrypt_data(encrypted_metrics_df, self.meta.get("metrics_to_encrypt"), decrypt_key)
        pd.testing.assert_frame_equal(raw_metrics_df, decrypted_metrics_df)

    def test_store(self):
        url = self.meta.get("url")
        reg_id = self.settings.get("registration_id")
        encrypt_key = read_key(self.root_dir + self.settings.get("encryption_key_file"))
        if (url is not None and url != "") and (reg_id is not None and reg_id != ""):
            response = store_to_database(self.collector, reg_id, encrypt_key)
            self.assertIsInstance(response, Response)
            self.assertEqual(response.status_code, 200)