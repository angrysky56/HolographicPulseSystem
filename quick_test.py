import requests
import json
import time
from datetime import datetime

def test_memory_system():
    BASE_URL = 'http://localhost:5000'
    
    def log_test(message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
    
    # Test health endpoint
    log_test("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200, "Health check failed"
    log_test("✓ Health check passed")
    
    # Add some test memories
    log_test("\nAdding test memories...")
    memories = []
    for i in range(3):
        content = {
            "content": f"Test memory {i + 1}",
            "timestamp": datetime.now().isoformat()
        }
        response = requests.post(f"{BASE_URL}/memory", json=content)
        assert response.status_code == 200, f"Failed to add memory {i + 1}"
        memories.append(response.json())
    log_test(f"✓ Added {len(memories)} test memories")
    
    # Test memory retrieval
    log_test("\nTesting memory retrieval...")
    for memory in memories:
        response = requests.get(f"{BASE_URL}/memory/{memory['id']}")
        assert response.status_code == 200, f"Failed to retrieve memory {memory['id']}"
    log_test("✓ Memory retrieval working")
    
    # Test search
    log_test("\nTesting search functionality...")
    response = requests.get(f"{BASE_URL}/search", params={"q": "test"})
    assert response.status_code == 200, "Search failed"
    results = response.json()
    assert len(results) > 0, "Search returned no results"
    log_test(f"✓ Search returned {len(results)} results")
    
    # Test active nodes
    log_test("\nTesting active nodes...")
    response = requests.get(f"{BASE_URL}/active")
    assert response.status_code == 200, "Failed to get active nodes"
    active_nodes = response.json()
    log_test(f"✓ Found {len(active_nodes)} active nodes")
    
    # Test system status
    log_test("\nChecking system status...")
    response = requests.get(f"{BASE_URL}/status")
    assert response.status_code == 200, "Failed to get system status"
    status = response.json()
    log_test(f"✓ System status: {json.dumps(status, indent=2)}")
    
    log_test("\nAll tests passed successfully!")

if __name__ == "__main__":
    try:
        test_memory_system()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        exit(1)