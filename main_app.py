# -*- coding: utf-8 -*-
"""
Created on Tue Jul 30 15:56:21 2024

@author: dell
"""
import os
import sys
from flask_cors import CORS
from flask import Flask
from pytz import timezone
from datetime import datetime , timedelta





app = Flask(__name__)

@app.route('/api/get-parking-data',methods=['POST'])
def predict_parking_availability():
    pass
    # if request.method =='POST':
    #     try:
            
            
            
            
            
    #     except Exception as e:
    #         print(str(e))



if __name__=='__main__':
    app.run(host='0.0.0.0',port=8080,threaded=True,debug=True)