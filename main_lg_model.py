# -*- coding: utf-8 -*-
"""
Created on Tue Jul 30 09:07:08 2024

@author: dell
"""

import pandas as pd
from datetime import datetime,timedelta
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report,accuracy_score
import pickle


df=pd.read_excel(r'simulation_data_hatch_back.xlsx',engine='openpyxl')


def transform_dataframe(df):

    df['date_time']=pd.to_datetime(df['date_time'],format='%d/%m/%Y %H:%M')
    df['year']=df['date_time'].dt.year
    df['month']=df['date_time'].dt.month
    df['day']=df['date_time'].dt.day
    df['day_of_week']=df['date_time'].dt.weekday
    df['hour']=df['date_time'].dt.hour
    df['minute']=df['date_time'].dt.minute
    df['date']=df['date_time'].dt.date
    df['time']=df['date_time'].dt.strftime('%H:%M')
    df['hour_min']=round(df['hour']+(df['minute']/60),1)
    df['month'].replace({1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'},inplace=True)
    df['month']=df['month'].astype('category')
    df['month']=df['month'].cat.set_categories(new_categories=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],ordered=True)
    df['day_of_week'].replace({0:'Mon',1:'Tue',2:'Wed',3:'Thu',4:'Fri',5:'Sat',6:'Sun'},inplace=True)
    df['day_of_week']=df['day_of_week'].astype('category')
    df['day_of_week']=df['day_of_week'].cat.set_categories(new_categories=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],ordered=True)
    df['hour']=df['hour'].astype('category')
    df['hour']=df['hour'].cat.set_categories(new_categories=list(range(24)),ordered=True)
    def parse_date(date_string):
        return datetime.strptime(date_string,'%d-%m-%Y').date()
    holiday_date=pd.read_csv(r'C:/Users/dell/Downloads/2023_holiday_data.csv')
    listofHolidays=holiday_date['date'].to_list()
    ph_parsed=[parse_date(ele) for ele in listofHolidays]
    eve_parsed=[parse_date(ele)-timedelta(days=1) for ele in listofHolidays]
    df['holiday']=np.where(df['date'].isin(ph_parsed),'ph','')
    df['eve']=np.where(df['date'].isin(eve_parsed),'eve','')
    
    return df

df=transform_dataframe(df)
df.to_excel(r'processed_suvs_data.xlsx',index=False)
df['slots_occupied']=df['slots_occupied'].fillna(0)
train_df=df.copy()
train_df=train_df[['hour_min','day_of_week','parking_availability','slots_occupied']]

numeric_transformer=Pipeline(steps=[("scaler",StandardScaler())])
categorical_transformer=OneHotEncoder(handle_unknown='ignore')
preprocessor=ColumnTransformer(transformers=[("num",numeric_transformer,["hour_min","slots_occupied"]),("cat",categorical_transformer,["day_of_week"])])
clf=Pipeline(steps=[("preprocessor",preprocessor),("classifier",LogisticRegression())])

X=train_df.drop(columns='parking_availability',axis=1)
y=train_df['parking_availability']
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=0)
clf.fit(X_train,y_train)



y_pred=clf.predict(X_test)
print(classification_report(y_test,y_pred))
acc = accuracy_score(y_test, y_pred)
print(acc)

# random_data={'hour_min':'09.45','day_of_week':'Tue','slots_occupied':'200'}
# slots_occupied_t=df['day_of_week'=='Tue']
# random_data_df=pd.DataFrame([random_data])
# y_pred=clf.predict(random_data_df)



file_name=r'model\suvs.sav'

pickle.dump(clf,open(file_name,'wb'))