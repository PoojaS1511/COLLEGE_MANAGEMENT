import re

# Read the app.py file
with open('app.py', 'r') as f:
    content = f.read()

# Find all route definitions
routes = re.findall(r'@app\.route\([\'\"](.*?)[\'\"]', content)

# Find all functions that use supabase
supabase_functions = set()
supabase_matches = re.finditer(r'def (.*?)\(.*?\):\s*.*?supabase\.', content, re.DOTALL)
for match in supabase_matches:
    supabase_functions.add(match.group(1))

print("🔍 Analyzing endpoints in app.py...")
print("=" * 50)

supabase_endpoints = []
postgres_endpoints = []
other_endpoints = []

# Find the function that follows each route
for i, route in enumerate(routes):
    # Find the function definition after this route
    route_pos = content.find(f"@app.route('{route}')")
    if route_pos == -1:
        route_pos = content.find(f'@app.route("{route}"')
    
    if route_pos != -1:
        # Look for the next function definition
        func_match = re.search(r'def (\w+)\(', content[route_pos:route_pos + 500])
        if func_match:
            func_name = func_match.group(1)
            
            # Check if this function uses supabase
            if func_name in supabase_functions:
                supabase_endpoints.append(route)
            elif 'execute_query' in content[route_pos:route_pos + 1000] or 'execute_insert' in content[route_pos:route_pos + 1000]:
                postgres_endpoints.append(route)
            else:
                other_endpoints.append(route)

print("❌ STILL USING SUPABASE:")
for endpoint in sorted(supabase_endpoints):
    print(f"  - {endpoint}")

print(f"\n✅ USING POSTGRESQL:")
for endpoint in sorted(postgres_endpoints):
    print(f"  - {endpoint}")

print(f"\n📋 OTHER/NEUTRAL:")
for endpoint in sorted(other_endpoints):
    print(f"  - {endpoint}")

print(f"\n📊 SUMMARY:")
print(f"Total endpoints: {len(routes)}")
print(f"Still using Supabase: {len(supabase_endpoints)}")
print(f"Using PostgreSQL: {len(postgres_endpoints)}")
print(f"Other/Neutral: {len(other_endpoints)}")
print(f"Migration progress: {len(postgres_endpoints)}/{len(routes)} ({len(postgres_endpoints)/len(routes)*100:.1f}%)")
