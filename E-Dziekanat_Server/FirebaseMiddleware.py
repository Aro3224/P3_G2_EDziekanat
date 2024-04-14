from firebase_admin import auth
from firebase_admin import db
from django.http import JsonResponse

class FirebaseAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        id_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        
        try:
            # Verify Firebase ID token
            decoded_token = auth.verify_id_token(id_token)
            print("Decoded token: ", decoded_token)
            # Fetch user's role from Firebase Realtime Database
            uid = decoded_token['uid']
            role_ref = db.reference('/users/{}/Rola'.format(uid))
            user_role = role_ref.get()
            print(user_role)

            # Check if user is an administrator
            if user_role != 'Pracownik':
                return JsonResponse({'error': 'Użytkownik musi być administratorem'}, status=403)
            
            # Attach user information to the request
            request.user = {
                'uid': uid,
                'role': user_role
            }
            
        except (auth.InvalidIdTokenError, KeyError):
            # Handle invalid ID token or missing user role
            request.user = None

        response = self.get_response(request)
        return response
