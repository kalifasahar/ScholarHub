from services.login_service_base import LoginServiceBase
from data_classes.User import User
import requests
from urllib.parse import quote
import xml.etree.ElementTree as ET

class LoginServiceBGU(LoginServiceBase):
    def __init__(self):
        super().__init__()
        self.base_url = 'https://bgu-cc-msdb.bgu.ac.il/BguAuthWebService/AuthenticationProvider.asmx'

    def _authenticate(self, user: User):
        action = 'validateAndGetGroups'
        soap_body = self.build_soap_body(action,  user.username, user.password, user.id)
        headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'HOST': 'bgu-cc-msdb.bgu.ac.il',
            'SOAPAction': f'http://tempuri.org/{action}'
        }

        response = self.send_soap_request(self.base_url, headers, soap_body)
        groups = self.parse_groups(response)

        self.log_manager.warning(f'Received response: {groups}')
        return 'err#err' not in groups
    
    
    def send_soap_request(self, url: str, headers: dict, body: str) -> bytes:
        """
        Sends a SOAP request to the specified URL with the given headers and body.

        Parameters:
            - url (str): The URL to send the SOAP request to.
            - headers (dict): The headers to include in the request.
            - body (str): The SOAP request body.

        Returns:
            bytes: The content of the response.
        """
        response = requests.post(url, headers=headers, data=body)
        return response.content


    def parse_groups(self, response: bytes) -> list:
        """
        Retrieves the list of groups from the SOAP response.

        Parameters:
            - response (bytes): The content of the SOAP response.

        Returns:
            list: List of group labels extracted from the response.
        """
        root = ET.fromstring(response)
        group_labels = []
        entry = root.find(".//{http://tempuri.org/}validateAndGetGroupsResponse")
        if entry is not None:
            nested_entry = entry.find(".//{http://tempuri.org/}validateAndGetGroupsResult")
            if nested_entry is not None:
                group_labels = nested_entry.text.strip().split(", ")

        return group_labels


    def build_soap_body(self, action: str, username: str, password: str, user_id: str) -> str:
        """
        Builds a SOAP request body with the specified action, username, password, and id.

        Parameters:
            - action (str): The SOAP action to perform.
            - username (str): The username to include in the SOAP request.
            - password (str): The password to include in the SOAP request.
            - user_id (str): The id to include in the SOAP request.

        Returns:
            str: The constructed SOAP request body.
        """
        soap_body = f'''
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header/>
        <soap:Body>
            <{action} xmlns="http://tempuri.org/">
            <uName>{quote(username)}</uName>
            <pwd>{quote(password)}</pwd>
            <id>{quote(user_id)}</id>
            </{action}>
        </soap:Body>
        </soap:Envelope>
        '''
        return soap_body
