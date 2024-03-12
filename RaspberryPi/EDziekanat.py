import time
import firebase_admin
from firebase_admin import credentials, db, messaging

cred = credentials.Certificate("/home/karolrpi/Dokumenty/fconfig.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app'
})


ADDRESS1 = "3a-0000005ed6e7"
ADDRESS2 = "3a-0000005ed8ab"

def read_button_state():
    try:
        with open(f"/sys/bus/w1/devices/{ADDRESS1}/state", "r") as gpio_file1, \
             open(f"/sys/bus/w1/devices/{ADDRESS2}/state", "r") as gpio_file2:
            gpio_state1 = gpio_file1.read().strip()
            gpio_state2 = gpio_file2.read().strip()
    except Exception as e:
        print("Wystapil blad: ",e)
    templates = refTemp.get()

    selected_template = None
    for key, value in templates.items():
        if isinstance(value, dict) and 'Wybrane' in value and value['Wybrane'] == True:
            selected_template = value.get('Tresc')
            break

    if gpio_state1 == "K":
        print("Przycisk B zosta nacinity")
        data = refToken.get()
        registration_token = data
        title = selected_template
        message = 'Tresc powiadomienia1'
        send_push_notification(registration_token, title, message)

    elif gpio_state1 != "Z":
        print("Przycisk A zosta nacinity")
        data = refToken.get()
        registration_token = data
        title = selected_template
        message = 'Tresc powiadomienia2'
        send_push_notification(registration_token, title, message)
    if gpio_state2 == "K":
        print("Przycisk D zosta nacinity")
        data = refToken.get()
        registration_token = data
        title = selected_template
        message = 'Tresc powiadomienia3'
        send_push_notification(registration_token, title, message)
    elif gpio_state2 != "Z":
        print("Przycisk C zosta nacinity")
        data = refToken.get()
        registration_token = data
        title = selected_template
        message = 'Tresc powiadomienia4'
        send_push_notification(registration_token, title, message)


def send_push_notification(registration_token, title, message):
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=message),
        token=registration_token,
    )
    response = messaging.send(message)
    print('Powiadomienie wyslane:', response)
    print(registration_token, title, message)




refTemp = db.reference('/Templates')
refToken = db.reference('/token/Token')

while True:
    try:
        read_button_state()
    except Exception as e:
        print("Wystąpił błąd: ",e)
    time.sleep(0.1)

