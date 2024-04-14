# views.py

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from firebase_admin import auth
import json
import requests
import vonage


@csrf_exempt
def verify_token_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = data.get('token')
        try:
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token.get('uid')
            email = decoded_token.get('email')
            return JsonResponse({'status': 'success', 'user_id': user_id, 'email': email})
        except auth.InvalidIdTokenError as e:
            return JsonResponse({'status': 'error', 'message': 'Nieprawidłowy token'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Nieprawidłowe żądanie'})
    

@csrf_exempt
def delete_user(request):
    if request.method == 'POST':
        deletedata = json.loads(request.body)
        uid = deletedata.get('UID')
        if uid:
            try:
                # Usuń użytkownika z Firebase Authentication
                auth.delete_user(uid)

                # Usuń dane użytkownika z Firebase Realtime Database
                database_url = "https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app/"
                response = requests.delete(f"{database_url}/users/{uid}.json")

                if response.status_code == 200:
                    return JsonResponse({'message': 'User deleted successfully'}, status=200)
                else:
                    return JsonResponse({'error': 'Failed to delete user data from Firebase database'}, status=500)

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'UID not provided'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if email and password:
            try:
                user = auth.create_user(email=email, password=password)
                uid = user.uid

                database_url = "https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app/"
                user_data = {"email": email}
                response = requests.put(f"{database_url}/users/{uid}.json", json=user_data)

                if response.status_code == 200:
                    return JsonResponse({'message': 'User created successfully', 'UID': uid}, status=200)
                else:
                    return JsonResponse({'error': 'Failed to create user data in Firebase database'}, status=500)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'Email or password not provided'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def edit_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        uid = data.get('UID')
        if uid:
            try:
                new_email = data.get('email')
                if new_email:
                    auth.update_user(uid, email=new_email)

                new_password = data.get('password')
                if new_password != "":
                    auth.update_user(uid, password=new_password)

                database_url = "https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app/"
                user_data = {} 
                if new_email:
                    user_data['email'] = new_email

                new_name = data.get('Imie')
                if new_name:
                    user_data['Imie'] = new_name

                new_surname = data.get('Nazwisko')
                if new_surname:
                    user_data['Nazwisko'] = new_surname

                new_phone = data.get('NrTelefonu')
                if new_phone:
                    user_data['NrTelefonu'] = new_phone

                new_role = data.get('Role')
                if new_role:
                    user_data['Rola'] = new_role

                response = requests.patch(f"{database_url}/users/{uid}.json", json=user_data)

                if response.status_code == 200:
                    return JsonResponse({'message': 'User updated successfully', 'UID': uid}, status=200)
                else:
                    return JsonResponse({'error': 'Failed to update user data in Firebase database'}, status=500)

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'UID not provided'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
def send_sms(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        uid = data.get('UID')
        content = data.get('body')
        if uid:
            try:
                database_url = "https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app/"
                # Pobieranie numeru telefonu z bazy danych
                response = requests.get(f"{database_url}/users/{uid}/NrTelefonu.json")
                if response.status_code == 200:
                    nr_telefonu = response.json()
                    if nr_telefonu:
                        # Vonage Account SID i Auth Token
                        client = vonage.Client(key="c5af630b", secret="VrAQHW3cFeD32Pmy")
                        sms = vonage.Sms(client)

                        responseData = sms.send_message(
                            {
                                "from": "E-dziekanat",
                                "to": '48' + nr_telefonu,
                                "text": content,
                            }
                        )

                        if responseData["messages"][0]["status"] == "0":
                            print("Message sent successfully.")
                        else:
                            print(f"Message failed with error: {responseData['messages'][0]['error-text']}")

                        return JsonResponse({'message': 'SMS sent successfully', 'UID': uid}, status=200)
                    else:
                        return JsonResponse({'error': 'Phone number not found for this user', 'UID': uid}, status=404)
                else:
                    return JsonResponse({'error': 'Failed to fetch user phone number in Firebase database'}, status=500)

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'UID not provided'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
