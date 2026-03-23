from flask import Flask, render_template, jsonify
from intelligence.forecast import forecast_usage
from termcolor import colored
import pyfiglet

app = Flask(__name__)

def show_banner():
    # Use a better font (try: 'slant', 'big', 'block', 'banner3-D')
    banner = pyfiglet.figlet_format("Veda", font="slant")

    # Gradient-like effect (manual color layering)
    lines = banner.split("\n")
    colors = ["cyan", "blue", "magenta", "red"]

    colored_banner = ""
    for i, line in enumerate(lines):
        color = colors[i % len(colors)]
        colored_banner += colored(line, color, attrs=["bold"]) + "\n"

    print(colored_banner)

    # Subtitle
    print(colored("Smart Pharmacy Intelligence. Real-time tracking, AI-driven expiry alerts, and optimized inventory for the next generation of healthcare.\n", "white", attrs=["bold"]))

    # Divider
    print(colored("─" * 50, "grey"))

    # Tips (Gemini-style)
    # print(colored("Tips:", "yellow", attrs=["bold"]))
    # print(colored("1. Ask complex questions", "white"))
    # print(colored("2. System shows agent reasoning", "white"))
    # print(colored("3. Type 'exit' to quit\n", "white"))

    # print(colored("─" * 50, "grey"))
@app.route('/')
def signup():
    return render_template('signup.html')
@app.route('/signin')
def signin():
    return render_template('signin.html')
@app.route('/manager_dashboard')
def manager_dashboard():
    return render_template('manager.html')
@app.route('/pharma_dashboard')
def pharma():
    return render_template('pharma.html')
@app.route('/admin_dashboard')
def admin_dashboard():
    return render_template('admin.html')
@app.route('/inventory')
def inventory():
    return render_template('inventory.html')
# admin
@app.route('/admin')
def admin():
    return render_template()
# notifications
@app.route('/notifications')
def notifications():
    # orders to warehouses
    # receipts to update the existing stock in db
    # low stock
    # expiry
    # recall
    # outbbreak
    return render_template('index.html')
@app.route('/inventry')
def inventry():
    return render_template('inventry.html')
@app.route('/setting')
def setting():
    return render_template('setting.html')
# emails

# Dummy data (replace with Firestore later)
data_store = {
    "Paracetamol": [10,12,15,13,18,20,22],
    "Ibuprofen": [5,6,7,6,8,9,10]
}

@app.route("/forecast/<medicine>")
def forecast(medicine):
    data = data_store.get(medicine, [])
    result = forecast_usage(data)

    return jsonify({
        "medicine": medicine,
        "forecast": result
    })
if __name__=="__main__":
    show_banner()
    app.run(debug=True)