import asyncio
import json
import urllib.request
import urllib.parse
from queue import Queue
from threading import Thread
from openai import OpenAI
from datetime import datetime

# Output queue for collecting responses
response_queue = Queue()

# Initialize client
client = OpenAI(base_url="http://localhost:1234/v1", api_key="not-needed")

def enqueue_output(content, type="response"):
    """Add timestamped output to queue"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    response_queue.put({
        "timestamp": timestamp,
        "type": type,
        "content": content
    })

async def fetch_wikipedia_content(search_query: str) -> dict:
    """Asynchronous Wikipedia content fetcher"""
    try:
        loop = asyncio.get_event_loop()
        search_url = "https://en.wikipedia.org/w/api.php"
        search_params = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": search_query,
            "srlimit": 1,
        }

        url = f"{search_url}?{urllib.parse.urlencode(search_params)}"
        
        def fetch():
            with urllib.request.urlopen(url) as response:
                return json.loads(response.read().decode())

        search_data = await loop.run_in_executor(None, fetch)

        if not search_data["query"]["search"]:
            return {
                "status": "error",
                "message": f"No Wikipedia article found for '{search_query}'",
            }

        title = search_data["query"]["search"][0]["title"]
        
        content_params = {
            "action": "query",
            "format": "json",
            "titles": title,
            "prop": "extracts",
            "exintro": "true",
            "explaintext": "true",
        }

        url = f"{search_url}?{urllib.parse.urlencode(content_params)}"
        data = await loop.run_in_executor(None, fetch)

        pages = data["query"]["pages"]
        page_id = list(pages.keys())[0]
        
        if page_id == "-1":
            return {
                "status": "error",
                "message": f"No Wikipedia article found for '{search_query}'",
            }

        content = pages[page_id]["extract"].strip()
        return {
            "status": "success",
            "content": content,
            "title": title
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

async def chat_with_model(messages, model_name="meta-llama-3.1-8b-instruct-abliterated"):
    """Asynchronous model interaction with streaming"""
    try:
        completion = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.7,
                stream=True,
                tools=[{
                    "type": "function",
                    "function": {
                        "name": "fetch_wikipedia_content",
                        "description": "Search Wikipedia and fetch content about a topic",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "search_query": {
                                    "type": "string",
                                    "description": "The topic to search for on Wikipedia"
                                }
                            },
                            "required": ["search_query"]
                        }
                    }
                }]
            )
        )

        collected_messages = []
        current_text = ""
        
        for chunk in completion:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                current_text += content
                enqueue_output(content, type="stream")
            
            if hasattr(chunk.choices[0].delta, 'tool_calls'):
                tool_call = chunk.choices[0].delta.tool_calls[0]
                if tool_call.function.name == "fetch_wikipedia_content":
                    args = json.loads(tool_call.function.arguments)
                    enqueue_output(f"Fetching Wikipedia content for: {args['search_query']}", type="tool")
                    result = await fetch_wikipedia_content(args['search_query'])
                    
                    if result["status"] == "success":
                        enqueue_output(f"Found article: {result['title']}", type="tool")
                        enqueue_output(result["content"], type="wiki")
                    
                    messages.append({
                        "role": "tool",
                        "content": json.dumps(result),
                        "tool_call_id": tool_call.id,
                    })
                    
                    # Get final response after tool use
                    follow_up = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: client.chat.completions.create(
                            model=model_name,
                            messages=messages,
                            stream=True
                        )
                    )
                    
                    for chunk in follow_up:
                        if chunk.choices[0].delta.content:
                            content = chunk.choices[0].delta.content
                            enqueue_output(content, type="stream")

        return messages

    except Exception as e:
        enqueue_output(f"Error: {str(e)}", type="error")
        return messages

async def process_input(query, model_name="meta-llama-3.1-8b-instruct-abliterated"):
    """Process a single input query"""
    messages = [{
        "role": "system", 
        "content": "You are a helpful AI assistant skilled at using tools to gather and explain information."
    }]
    
    enqueue_output(f"Processing query with model {model_name}: {query}", type="info")
    messages.append({"role": "user", "content": query})
    
    await chat_with_model(messages, model_name)
    enqueue_output("Query processing complete", type="info")

def output_monitor():
    """Monitor and print queue contents"""
    while True:
        output = response_queue.get()
        if output["type"] == "stream":
            print(output["content"], end="", flush=True)
        elif output["type"] == "wiki":
            print(f"\n{'='*80}\n{output['content']}\n{'='*80}\n")
        else:
            print(f"\n[{output['timestamp']}] {output['type']}: {output['content']}")

async def main():
    # Start output monitor in separate thread
    monitor_thread = Thread(target=output_monitor, daemon=True)
    monitor_thread.start()
    
    # Test different models
    models = [
        "meta-llama-3.1-8b-instruct-abliterated",
        "starling-lm-7b-beta",
        "nexusraven-v2-13b"
    ]
    
    queries = [
        "What are the main principles of quantum computing?",
        "Explain the concept of neural networks in AI.",
        "What is the relationship between entropy and information theory?"
    ]
    
    # Process queries with different models
    tasks = []
    for model in models:
        for query in queries:
            tasks.append(process_input(query, model))
    
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())