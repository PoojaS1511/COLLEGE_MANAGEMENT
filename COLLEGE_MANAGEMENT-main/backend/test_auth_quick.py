from auth_service import auth_service
try:
    user = auth_service.authenticate_user('student@example.com', 'password123')
    if user:
        print('✅ Auth service working')
        tokens = auth_service.generate_tokens(user['id'])
        print('✅ Token generation working')
        print('✅ Authentication system is ready')
    else:
        print('❌ Auth service failed')
except Exception as e:
    print(f'❌ Error: {e}')
