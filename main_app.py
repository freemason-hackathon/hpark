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
import logging
import pdb



log = logging.getLogger(__name__)

logging.basicConfig(filename=r'logs/hpark_py_app.log', level=logging.INFO)
app = Flask(__name__)

@app.route('/api/get-parking-data',methods=['POST'])
def predict_parking_availability():
    # pass
    # if request.method =='POST':
    try:
        ipdata=request.get_json()
        date=ipdata['dateTime']
        Ctype=ipdata['carType']
        probability=ipdata['percentage']
        log.info(" Input Data Recieved : {} {}".format(date,Ctype))
        url='http://35.207.226.222:8080/getParkingData'
        # 35.200.146.127

        x={"dateTime":date,"carType":Ctype}
        resp=requests.post(url,json=x)
        
        if Ctype == 'HatchBack':
            fname=r'model/hatch_back.sav'
            log.info('Hatchback Model Loaded in memory')
            with open(fname,'rb') as f:
                myModel = pickle.load(f)
        if Ctype=='suv':
            fname=r'model/suvs.sav'
            log.info('SUV Model Loaded in Memory')
            with open(fname,'rb') as f:
                myModel = pickle.load(f)
        
        dateList=date.split(' ')[1].split(':')[:2]
        hour_min='.'.join(dateList)
        # date="01-01-2024 08:02:00"
        dateObj=datetime.strptime(date, '%d-%m-%Y %H:%M:%S')
        dayname=dateObj.strftime('%a')
        model_data={'hour_min':hour_min,'day_of_week':dayname,'slots_occupied':resp.json()['availableSlots']}
        model_data_df=pd.DataFrame([model_data])
        log.info('Initailaizing Prediction')
        o_pred=myModel.predict(model_data_df)        
        o_pred=list(o_pred)[0]
        log.info('Adding initial logs')
        current_datetime=datetime.now()
        current_datetime=current_datetime.strftime(format='%d-%b')
        
        
        
        weather_df=pd.read_excel('weather_data_pune.xlsx',engine='openpyxl')
        weather_latest_eval=pd.read_excel('weather_evaluation.xlsx',engine='openpyxl')
        
        current_weather=weather_df[weather_df['Date']==current_datetime]
        current_weather=current_weather.to_dict(orient='records')[0]
        
        weather_agg_per=weather_latest_eval[weather_latest_eval['weather']==current_weather['Weather']]
        weather_agg_per=weather_agg_per.to_dict(orient='records')[0]['weight']
        
        prob_per=((int(probability)+int(weather_agg_per)/2))
        
        response_json={"availableSlots":resp.json()['availableSlots'],
                       "carParkingAvailable":o_pred,
                       "totalSlots":resp.json()['totalSlots'],
                       "carType":Ctype,
                       'maxTemp':current_weather['Max Temp'],
                       'minTemp':current_weather['Min Temp'],
                       'weatherCondition':current_weather['Weather'],
                       'parkingProbPercentage':prob_per}
        
        
        return jsonify(response_json),200
        
        
    except Exception as e:
        return jsonify({"error":str(e)})
        log.info(str(e))



if __name__=='__main__':
    app.run(host='0.0.0.0',port=8081,threaded=True,debug=True)