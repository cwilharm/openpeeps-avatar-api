#!/usr/bin/env python3
"""Test script for Avatar Generator API"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=== Testing Avatar Generator API ===\n")

# Test 1: Root endpoint
print("1. Testing root endpoint...")
response = requests.get(f"{BASE_URL}/")
print(f"   Status: {response.status_code}")
print(f"   Response: {json.dumps(response.json(), indent=2)}\n")

# Test 2: Options endpoint
print("2. Testing options endpoint...")
response = requests.get(f"{BASE_URL}/options")
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Head options: {len(data['categories']['head'])}")
print(f"   Face options: {len(data['categories']['face'])}")
print(f"   Body options: {len(data['categories']['body'])}")
print(f"   Facial-hair options: {len(data['categories']['facial-hair'])}")
print(f"   Accessories options: {len(data['categories']['accessories'])}\n")

# Test 3: Generate specific avatar
print("3. Testing avatar generation with specific selection...")
selection = {
    "head": 5,
    "face": 25,
    "body": 23,
    "facial_hair": 0,
    "accessories": 0
}
response = requests.post(f"{BASE_URL}/avatar/generate", json=selection)
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Generated key: {data['key']}")
print(f"   SVG length: {len(data['svg'])} characters")
print(f"   SVG starts with: {data['svg'][:80]}...\n")

# Test 4: Get avatar by key
print(f"4. Testing get avatar by key ({data['key']})...")
response = requests.get(f"{BASE_URL}/avatar/{data['key']}")
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Key: {data['key']}")
print(f"   SVG length: {len(data['svg'])} characters\n")

# Test 5: Generate random avatar
print("5. Testing random avatar generation...")
response = requests.get(f"{BASE_URL}/avatar/random")
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Random key: {data['key']}")
print(f"   SVG length: {len(data['svg'])} characters\n")

print("=== All tests completed successfully! ===")
