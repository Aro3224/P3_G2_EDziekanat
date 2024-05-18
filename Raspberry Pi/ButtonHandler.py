import time
import board
import busio
import digitalio
from adafruit_mcp230xx.mcp23017 import MCP23017
import adafruit_aw9523
import firebase_admin
from firebase_admin import credentials, db
from pyfcm import FCMNotification
import vonage
import logging
import os

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler(os.path.expanduser("~/button_handler.log")),
        logging.StreamHandler()
    ]
)

# Firebase configuration
cred = credentials.Certificate("/home/karolrpi/e-dziekanat-4e60f-firebase-adminsdk-t7grn-01e3972a35.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app/'
})

# Initialize Vonage client
vonage_client = vonage.Client(key="c5af630b", secret="VrAQHW3cFeD32Pmy")
sms = vonage.Sms(vonage_client)

# Initialize I2C buses
i2c1 = busio.I2C(board.SCL, board.SDA)
i2c2 = board.I2C()

# Initialize expanders
mcp1 = MCP23017(i2c1, address=0x20)
mcp2 = MCP23017(i2c1, address=0x21)
aw1 = adafruit_aw9523.AW9523(i2c2, address=0x58)
aw2 = adafruit_aw9523.AW9523(i2c2, address=0x59)
aw3 = adafruit_aw9523.AW9523(i2c2, address=0x5a)

# Configure pins (example for configuration)
NUM_PINS_EXPANDER_1 = 0
NUM_PINS_EXPANDER_2 = 0
NUM_PINS_EXPANDER_3 = 0
NUM_PINS_EXPANDER_4 = 2
NUM_PINS_EXPANDER_5 = 2

pins1 = [mcp1.get_pin(i) for i in range(NUM_PINS_EXPANDER_1)]
pins2 = [mcp2.get_pin(i) for i in range(NUM_PINS_EXPANDER_2)]
pins3 = [aw1.get_pin(i) for i in range(NUM_PINS_EXPANDER_3)]
pins4 = [aw2.get_pin(i) for i in range(NUM_PINS_EXPANDER_4)]
pins5 = [aw3.get_pin(i) for i in range(NUM_PINS_EXPANDER_5)]

for pin in pins1 + pins2:
    pin.direction = digitalio.Direction.INPUT
    pin.pull = digitalio.Pull.UP
for pin in pins3 + pins4 + pins5:
    pin.direction = digitalio.Direction.INPUT

def send_notification(btn_number):
    try:
        templates_ref = db.reference('/templates')
        templates = templates_ref.get()
        if templates:
            for template_id, template_data in templates.items():
                if template_data.get('inUse', False):
                    title = template_data.get('title', '')
                    content = template_data.get('content', '')
                    notify_users(btn_number, title, content)
    except Exception as e:
        logging.error(f"Failed to send notification for button {btn_number}: {e}")

def notify_users(btn_number, title, content):
    try:
        button_data = db.reference(f"/buttons/{btn_number}").get()
        if button_data:
            user_id = button_data.get('userID')
            user_type = button_data.get('type', 'user')
            if user_id:
                if user_type == 'group':
                    notify_group_users(user_id, title, content)
                else:
                    notify_user(user_id, title, content)
    except Exception as e:
        logging.error(f"Failed to notify users for button {btn_number}: {e}")

def notify_user(user_id, title, content):
    try:
        user_data = db.reference(f"/users/{user_id}").get()
        if user_data:
            send_sms = user_data.get('SendSMS', False)
            if send_sms:  # send_sms is a boolean, should not be called
                phone_number = user_data.get('NrTelefonu')
                if phone_number:
                    send_sms_message(phone_number, title, content)
                else:
                    logging.error(f"No phone number found for user {user_id}")
            else:
                user_token = user_data.get('mobtoken')
                if user_token:
                    push_service = FCMNotification(api_key="AAAAFrz_bZ0:APA91bH6oyJxF6tAzuTY3LIG193k4bITsnLsEZEFB0funtYs3oCfPF0JfRZlsNwN5mzy9b6QitIqaP757lcrrG3r56wWjrPRq1_F6SrzIqkr9uh1TEfkDm60PBbmBlA4rHHpuz7JEOUb")
                    result = push_service.notify_single_device(registration_id=user_token, message_title=title, message_body=content)
                    if result['success'] == 1:
                        logging.info("Push notification sent successfully")
                        log_notification(user_id, title, content)
                    else:
                        logging.error("Failed to send push notification")
                else:
                    logging.error(f"No token found for user {user_id}")
    except Exception as e:
        logging.error(f"Error sending notification to user {user_id}: {e}")

def notify_group_users(group_id, title, content):
    try:
        group_users = db.reference(f"/groups/{group_id}/Users").get()
        if group_users:
            for group_user_id in group_users:
                notify_user(group_user_id, title, content)
    except Exception as e:
        logging.error(f"Error notifying group {group_id}: {e}")

def send_sms_message(phone_number, title, content):
    try:
        response = sms.send_message({
            'from': 'E-Dziekanat',
            'to': '48' + phone_number,
            'text': f"{title}\n{content}"
        })
        if response["messages"][0]["status"] == "0":
            logging.info("SMS sent successfully")
        else:
            logging.error(f"Failed to send SMS: {response['messages'][0]['error-text']}")
    except Exception as e:
        logging.error(f"Error sending SMS to {phone_number}: {e}")

def log_notification(user_id, title, content):
    try:
        timestamp = int(time.time() * 1000)
        notification_data = {
            'czas': timestamp,
            'tytul': title,
            'tresc': content,
            'odczytano': False
        }
        db.reference(f"/notifications/{user_id}").push(notification_data)
    except Exception as e:
        logging.error(f"Error logging notification for user {user_id}: {e}")

def main():
    logging.info("Button Handler ready")
    while True:
        if not any([pin.value for pin in pins1 + pins2 + pins3 + pins4 + pins5]):
            time.sleep(0.1)
            continue
        handle_button_presses()
        time.sleep(0.3)

def handle_button_presses():
    for i, pin in enumerate(pins1):
        if not pin.value:
            handle_button_press(i + 1, "Expander 1")
    for i, pin in enumerate(pins2):
        if not pin.value:
            handle_button_press(i + 1, "Expander 2")
    for i, pin in enumerate(pins3):
        if not pin.value:
            handle_button_press(i + 1, "Expander 3")
    for i, pin in enumerate(pins4):
        if not pin.value:
            handle_button_press(i + 1, "Expander 4")
    for i, pin in enumerate(pins5):
        if not pin.value:
            handle_button_press(i + 1, "Expander 5")

def handle_button_press(button_number, expander):
    logging.info(f"Button {button_number} ({expander}) pressed!")
    send_notification(button_number)

if __name__ == '__main__':
    main()
