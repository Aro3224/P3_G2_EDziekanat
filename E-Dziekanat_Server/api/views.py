# views.py

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import firebase_admin
from firebase_admin import auth
import json
import requests


# Inicjalizacja aplikacji Firebase
# Pamiętaj, aby umieścić plik konfiguracyjny Firebase w odpowiednim miejscu
# i zaimportować go tutaj przed użyciem Firebase
# firebase_admin.initialize_app()

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

                # Tworzenie dziecka w bazie danych Firebase Realtime Database
                database_url = "https://e-dziekanat-4e60f-default-rtdb.europe-west1.firebasedatabase.app/"
                user_data = {"email": email}  # Tutaj możesz dodać więcej danych użytkownika
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


