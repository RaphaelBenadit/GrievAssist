#!/usr/bin/env python3
"""
Test script for the ML service
Run this to test the ML service locally
"""

import requests
import json

def test_ml_service():
    """Test the ML service with sample complaints"""
    
    # Test data
    test_complaints = [
        "There is garbage on the streets, it smells bad and needs immediate attention",
        "The road has a huge pothole that damages vehicles",
        "No electricity in our area for the past 3 days",
        "Water supply is irregular and contaminated",
        "Street lights are not working in our neighborhood"
    ]
    
    base_url = "http://localhost:8001"
    
    print("🧪 Testing ML Service...")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print("❌ Health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML service. Make sure it's running on port 8001")
        return
    
    # Test prediction endpoint
    for i, complaint in enumerate(test_complaints, 1):
        print(f"\n🔍 Test {i}: {complaint[:50]}...")
        
        try:
            response = requests.post(
                f"{base_url}/predict",
                json={"text": complaint, "top_k": 3},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Category: {data['category']}")
                print(f"✅ Priority: {data['priority']}")
                print(f"✅ Confidence: {data['confidence']:.3f}")
                print(f"✅ Fake Score: {data['isFakeScore']:.3f}")
                print(f"✅ Top 3: {[item['label'] for item in data['top_k']]}")
            else:
                print(f"❌ Prediction failed: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 ML Service testing completed!")

if __name__ == "__main__":
    test_ml_service()
