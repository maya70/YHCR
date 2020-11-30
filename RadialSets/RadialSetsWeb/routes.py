import pandas as pd
from flask import Flask, render_template, send_from_directory, jsonify
from google.cloud import bigquery
from google.oauth2 import service_account
import google.auth
import json

app = Flask(__name__)
print('here')

# two decorators, same function
@app.route('/')
@app.route('/demo.html')
def demo():
    print('in')
    return render_template('demo.html', the_title='RadSets')