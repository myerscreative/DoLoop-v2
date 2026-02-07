class UserMessage:
    def __init__(self, text):
        self.text = text

class LlmChat:
    def __init__(self, api_key, session_id, system_message):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
    
    def with_model(self, provider, model):
        return self
    
    async def send_message(self, message):
        # Return a mock AI response in JSON format as expected by server.py
        mock_response = {
            "name": "Mocked Loop",
            "description": "This is a mocked response because the AI integration is unavailable locally.",
            "color": "#FFC93A",
            "reset_rule": "daily",
            "tasks": [
                {"description": "Mocked task 1", "type": "recurring"},
                {"description": "Mocked task 2", "type": "one-time"}
            ]
        }
        import json
        return type('obj', (object,), {'text': json.dumps(mock_response)})
