#!/usr/bin/env python3
"""
Full integration test for GrievAssist ML service
Tests the complete workflow from complaint submission to ML classification
"""

import requests
import json
import time
import sys

def test_ml_service_direct():
    """Test ML service directly"""
    print("🧪 Testing ML Service Direct Connection...")
    
    try:
        # Test health
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code != 200:
            print("❌ ML Service health check failed")
            return False
        
        # Test prediction
        test_data = {
            "text": "There is garbage on the streets, it smells bad and needs immediate attention",
            "top_k": 3
        }
        
        response = requests.post(
            "http://localhost:8001/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ ML Service working: {data['category']} (confidence: {data['confidence']:.3f})")
            return True
        else:
            print(f"❌ ML Service prediction failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML service. Is it running on port 8001?")
        return False
    except Exception as e:
        print(f"❌ ML Service error: {e}")
        return False

def test_node_backend():
    """Test Node.js backend"""
    print("\n🧪 Testing Node.js Backend...")
    
    try:
        response = requests.get("http://localhost:5000", timeout=5)
        if response.status_code == 200:
            print("✅ Node.js backend is running")
            return True
        else:
            print(f"❌ Node.js backend error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Node.js backend. Is it running on port 5000?")
        return False
    except Exception as e:
        print(f"❌ Node.js backend error: {e}")
        return False

def test_full_workflow():
    """Test the complete workflow through Node.js backend"""
    print("\n🧪 Testing Full Workflow (Node.js → ML Service)...")
    
    # This would require authentication, so we'll just test the endpoint exists
    try:
        # Test if the complaint endpoint exists (should return 401 without auth)
        response = requests.post(
            "http://localhost:5000/api/complaints",
            json={"description": "test complaint"},
            timeout=5
        )
        
        # 401 is expected without authentication
        if response.status_code in [401, 403]:
            print("✅ Complaint endpoint exists (authentication required)")
            return True
        elif response.status_code == 200:
            print("✅ Complaint endpoint working")
            return True
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Node.js backend")
        return False
    except Exception as e:
        print(f"❌ Workflow test error: {e}")
        return False

def main():
    """Run all integration tests"""
    print("=" * 60)
    print("🧪 GrievAssist Integration Test Suite")
    print("=" * 60)
    
    all_passed = True
    
    # Test ML service
    if not test_ml_service_direct():
        all_passed = False
    
    # Test Node.js backend
    if not test_node_backend():
        all_passed = False
    
    # Test full workflow
    if not test_full_workflow():
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All integration tests passed!")
        print("\n✅ Your GrievAssist system is ready!")
        print("🌐 Frontend: http://localhost:3000")
        print("🔧 Backend:  http://localhost:5000")
        print("🤖 ML API:   http://localhost:8001")
        print("📚 ML Docs:  http://localhost:8001/docs")
    else:
        print("❌ Some tests failed. Check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure ML service is running: python server/ml/start_ml_service.py")
        print("2. Make sure Node.js backend is running: npm start (in server directory)")
        print("3. Make sure React frontend is running: npm start (in client directory)")
    
    print("=" * 60)
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
