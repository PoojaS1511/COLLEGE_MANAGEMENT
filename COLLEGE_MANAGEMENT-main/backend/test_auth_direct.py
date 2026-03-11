from auth_service import auth_service

# Test authentication directly
user = auth_service.authenticate_user('student@example.com', 'password123')
if user:
    print('✅ Authentication successful')
    print(f'User ID: {user["id"]}')
    print(f'Email: {user["email"]}')
    print(f'Role: {user["role"]}')
    
    # Test token generation
    tokens = auth_service.generate_tokens(user['id'])
    print('✅ Tokens generated')
    print(f'Access token: {tokens["access_token"][:50]}...')
else:
    print('❌ Authentication failed')
