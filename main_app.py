# -*- coding: utf-8 -*-
"""
Created on Tue Jul 30 15:56:21 2024

@author: dell
"""
import os
import sys
from flask_cors import CORS
from flask import Flask,request,jsonify
from pytz import timezone
from datetime import datetime , timedelta
import requests
import pickle



app = Flask(__name__)

@app.route('/api/get-parking-data',methods=['POST'])
def predict_parking_availability():
    # pass
    # if request.method =='POST':
    try:
        ipdata=request.get_json()
        date=ipdata['date']
        Ctype=ipdata['type']
        url='http://35.200.146.127:8080/getParkingData'
        # 35.200.146.127

        x={"dateTime":"01-01-2024 08:02:00","carType":"HatchBack"}
        resp=requests.post(url,json=x)
        
        if Ctype == 'HatchBack':
            myModel = pickle.loads(r'model/hatch_back.sav')
        if Ctype=='SUV':
            myModel=pickle.loads(r'model/suvs.sav')
        
        # 'hour_min'=round(date.split()+(df['minute']/60),1)
        
        
        
        
    except Exception as e:
        print(str(e))



if __name__=='__main__':
    app.run(host='0.0.0.0',port=8080,threaded=True,debug=True)