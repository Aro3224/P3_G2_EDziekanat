import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth

cred = credentials.Certificate("./e-dziekanat-4e60f-firebase-adminsdk-t7grn-01e3972a35.json")
firebase_admin.initialize_app(cred)

# Dodawanie użytkownika testowe
#email = input('Wprowadź email: ')
#password = input('Wprowadź hasło: ')
#user = auth.create_user(email = email, password = password)
#print("Użytkownik został stworzony: {0}".format(user.uid))

# Usuwanie użytkownike testowe
uid = input('Wprowadź UID użytkownika: ')
auth.delete_user(uid)
print("Użytkownik został usunięty")