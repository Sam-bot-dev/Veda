from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def signup():
    return render_template('signup.html')
@app.route('/signin')
def signin():
    return render_template('signin.html')
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')
@app.route('/inventory')
def inventory():
    return render_template('inventory.html')
# admin
# notifications
# emails