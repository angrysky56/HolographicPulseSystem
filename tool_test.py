from openai import OpenAI
import json

# Initialize client with LM Studio's URL
client = OpenAI(base_url="http://localhost:1234/v1", api_key="not-needed")

# Tool definition
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    }
]

def test_tool_use():
    response = client.chat.completions.create(
        model="meta-llama-3.1-8b-instruct-abliterated",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that uses tools when needed."},
            {"role": "user", "content": "What's the weather like in San Francisco?"}
        ],
        tools=tools,
        tool_choice="auto",  # auto is default, but we'll be explicit
        stream=False  # Disable streaming for immediate response
    )
    
    print("\nModel's Initial Response:")
    print(response.choices[0].message)
    
    # If the model wants to use a tool
    if response.choices[0].message.tool_calls:
        tool_calls = response.choices[0].message.tool_calls
        print("\nTool Calls Requested:")
        for tool_call in tool_calls:
            print(f"Tool: {tool_call.function.name}")
            print(f"Arguments: {tool_call.function.arguments}")
            
            # Here we could actually call the function and get real weather data
            # For demo, we'll just return a mock response
            weather_data = {
                "temperature": 22,
                "unit": "celsius",
                "condition": "sunny"
            }
            
            # Add the function response to messages
            messages = [
                {"role": "system", "content": "You are a helpful assistant that uses tools when needed."},
                {"role": "user", "content": "What's the weather like in San Francisco?"},
                response.choices[0].message,
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_call.function.name,
                    "content": json.dumps(weather_data)
                }
            ]
            
            # Get final response after tool use
            final_response = client.chat.completions.create(
                model="meta-llama-3.1-8b-instruct-abliterated",
                messages=messages,
                stream=False
            )
            
            print("\nFinal Response after tool use:")
            print(final_response.choices[0].message.content)

if __name__ == "__main__":
    print("Testing LM Studio tool use...")
    test_tool_use()