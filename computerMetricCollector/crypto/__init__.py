from Cryptodome.Cipher import AES, PKCS1_OAEP
from Cryptodome.PublicKey import RSA
from Cryptodome.Random import get_random_bytes
import requests


def get_key(reg_id, url):
    """
    Get the key from the remote server using the registration key and the url for the api
    :param reg_id: Registration key associated to the user's account
    :param url: URL of the api to call
    :return: public key in string
    """
    response = requests.post(url, json={"registration_id": reg_id})
    res_json = response.json()
    public_key = None
    if res_json.get("success") and res_json.get("data"):
        data = res_json.get("data")
        public_key = data.get("public_key")
    return public_key


def encrypt_data(collector, key):
    """
    This function encrypt the raw data in the collector with the pass in key value
    :param collector: Collector class with the raw data frame to encrypt
    :param key: public key use in the encryption
    :return:
    """
    collector.logger.debug("Encrypting " + type(collector).__name__ + " data")
    df = collector.metrics_df
    metrics_to_encrypt = collector.metrics_to_encrypt
    public_key = RSA.import_key(key)
    cipher_rsa = PKCS1_OAEP.new(public_key)
    num_bytes = 16
    # Store the nonce and session key to be use in decrypting data
    for idx, row in df.iterrows():
        session_key = get_random_bytes(num_bytes)
        enc_session_key = cipher_rsa.encrypt(session_key)
        cipher_aes = AES.new(session_key, AES.MODE_EAX)
        df.loc[idx, "nonce"] = cipher_aes.nonce.hex()
        df.loc[idx, "session_key"] = enc_session_key.hex()
        for col in metrics_to_encrypt:
            if col in row:
                data = str(row[col]).encode("utf-8")
                ciphertext = cipher_aes.encrypt(data)
                df.loc[idx, col] = ciphertext.hex()
    collector.metrics_df = df
    collector.logger.debug("End encrypting " + type(collector).__name__ + " data")
