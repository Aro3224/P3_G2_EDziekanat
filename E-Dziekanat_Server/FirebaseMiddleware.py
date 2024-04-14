from firebase_admin import auth

class FirebaseAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        id_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        print(id_token)
        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token
            print(decoded_token)
        except auth.InvalidIdTokenError:
            request.user = None

        response = self.get_response(request)
        return response
