from flask import Flask, render_template, url_for
from flask import request
import requests
import time

app = Flask(__name__)

this_session = ""

@app.route("/")
def home():
    headers = {"Content-Type": "application/json"}
    # body = {"state": {"key1": "value1", "key2": "42"}}
    body = {}
    user_name = "somebody"
    global this_session
    this_session = str(time.time())
    response = requests.post(
        f"http://localhost:8000/apps/my-first-ai-agent/users/{user_name}/sessions/{this_session}",
        headers=headers,
        json=body,
    )
    print(response.status_code)
    print(response.text)
    return render_template("index.html")


@app.route("/call_llm", methods=["POST"])
def call_llm():
    if request.method == "POST":
        print("POST!")
        data = request.form
        print(data)
        to_llm = data["message"]
        try:
            global this_session
            headers = {"Content-Type": "application/json"}
            body = {
                "app_name": "my-first-ai-agent",
                "user_id": "somebody",
                "session_id": this_session,
                "new_message": {
                    "role": "user",
                    "parts": [{"text": to_llm}],
                },
            }
            response = requests.post(
                "http://localhost:8000/run", headers=headers, json=body
            )
            print(response.status_code)
            # print(response.text)
            result_json = response.json()
            print(result_json)
            result_text = ""
            for thisResponse in result_json:
                for thisPart in thisResponse["content"]["parts"]:
                    if "functionCall" in thisPart:
                        print(f"function call - {thisPart['functionCall']['name']}")
                        result_text += "<span style='color:gray'>"
                        result_text += (
                            "[Function Call] " + thisPart["functionCall"]["name"]
                        )
                        if "args" in thisPart["functionCall"]:
                            for thisArg_name, thisArg_value in thisPart["functionCall"][
                                "args"
                            ].items():
                                print(f"arg - {thisArg_name}: {thisArg_value}")
                                result_text += (
                                    " ["
                                    + thisArg_name
                                    + "] : "
                                    + thisArg_value
                                    + "&nbsp;&nbsp;"
                                )
                        result_text += "</span><br>"
                    elif "functionResponse" in thisPart:
                        #check if report exists
                        if "report" in thisPart["functionResponse"]["response"]:
                            print(
                                f"function response - {thisPart['functionResponse']['response']['report']}"
                            )
                            result_text += "<span style='color:gray'>"
                            result_text += (
                                "[Function Response] "
                                + thisPart["functionResponse"]["response"]["report"]
                            )
                            result_text += "</span><br>"
                        # check if result['content'][0]['text'] exists
                        elif "result" in thisPart["functionResponse"]["response"]:
                            if (
                                len(thisPart["functionResponse"]["response"]["result"]['content']) > 0
                                and "text" in thisPart["functionResponse"]["response"]["result"]['content'][0]
                            ):
                                print(
                                    f"function response - {thisPart['functionResponse']['response']['result']['content'][0]['text']}"
                                )
                                result_text += "<span style='color:gray'>"
                                result_text += (
                                    "[Function Response] " + thisPart["functionResponse"]["response"]["result"]["content"][0]["text"]
                                )
                                result_text += "</span><br>"
                        #check if ['content'][0]['text'] exists
                        elif "content" in thisPart["functionResponse"]["response"]:
                            if (
                                len(thisPart["functionResponse"]["response"]["content"]) > 0
                                and "text" in thisPart["functionResponse"]["response"]["content"][0]
                            ):
                                print(
                                    f"function response - {thisPart['functionResponse']['response']['content'][0]['text']}"
                                )
                                result_text += "<span style='color:gray'>"
                                result_text += (
                                    "[Function Response] " + thisPart["functionResponse"]["response"]["content"][0]["text"]
                                )
                                result_text += "</span><br>"
                        
                    elif "text" in thisPart:
                        print(f"message - {thisPart['text']}")
                        result_text += thisPart["text"] + "<br>"  
                    else:
                        print(f"something else - {thisPart}")
        except Exception as e:
            print(e)
            return "我媽來了，她說不能聊這個(雙手比叉)"
        return result_text



if __name__ == "__main__":
    app.run(debug=True)
