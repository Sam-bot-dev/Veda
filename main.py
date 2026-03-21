from flask import Flask, render_template

app = Flask(__name__)

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


if __name__=="__main__":
    app.run(debug=True)