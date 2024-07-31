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
import pandas as pd



app = Flask(__name__)

@app.route('/api/get-parking-data',methods=['POST'])
def predict_parking_availability():
    # pass
    # if request.method =='POST':
    try:
        ipdata=request.get_json()
        date=ipdata['dateTime']
        Ctype=ipdata['carType']
        url='http://35.207.226.222:8080/getParkingData'
        # 35.200.146.127

        x={"dateTime":date,"carType":Ctype}
        resp=requests.post(url,json=x)
        
        if Ctype == 'HatchBack':
            fname=r'model/hatch_back.sav'
            with open(fname,'rb') as f:
                myModel = pickle.load(f)
        if Ctype=='SUV':
            fname=r'model/suvs.sav'
            with open(fname,'rb') as f:
                myModel = pickle.load(f)
        
        dateList=date.split(' ')[1].split(':')[:2]
        hour_min='.'.join(dateList)
        # date="01-01-2024 08:02:00"
        dateObj=datetime.strptime(date, '%d-%m-%Y %H:%M:%S')
        dayname=dateObj.strftime('%a')
        model_data={'hour_min':hour_min,'day_of_week':dayname,'slots_occupied':resp.json()['availableSlots']}
        model_data_df=pd.DataFrame([model_data])
        o_pred=myModel.predict(model_data_df)        
        o_pred=list(o_pred)[0]
        
        response_json={"availableSlots":resp.json()['availableSlots'],"CarParkingAvailable":o_pred,"totalSlots":resp.json()['totalSlots'],"carType":Ctype}
        return jsonify(response_json),200
        
        
    except Exception as e:
        return jsonify({"error":str(e)})
        print(str(e))



if __name__=='__main__':
    app.run(host='0.0.0.0',port=8081,threaded=True,debug=True)