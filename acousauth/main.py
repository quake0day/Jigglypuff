#!/usr/bin/python
# -*-coding:utf-8 -*-
import time;
import threading;
import web

urls = (
    '/', 'index',
    '/submit', 'submit'
)


class index:
    def GET(self):
        tmpl = web.template.render("tmpl/")
        return tmpl.index()

    def POST(self):
        #data = web.data()
        return "OK"

class submit:
    def POST(self):
        data = web.data()
        f = open("./temp",'w')
        f.write(data)
        f.close()
        #print data
        return "OK"


class MTimerClass(threading.Thread):  # cookie监控时钟
    def __init__(self,fn,args=(),sleep=1):        
        threading.Thread.__init__(self)
        self.fn = fn  
        self.args = args  
        self.sleep = sleep 
        self.setDaemon(True)
        
        self.isPlay = True  #当前是否运行 
        self.fnPlay = False #当前已经完成运行
        self.thread_stop=False; 
        
    def SetSleep(self,sleep): # 重新设置 时间间隔
        self.sleep=sleep;
        
    def __do(self):
        self.fnPlay = True;
        apply(self.fn,self.args);
        self.fnPlay = False 

    def run(self): 
        while self.isPlay : 
            if self.thread_stop==True:
                break;
            #if SubCommon.ifexeStop==True:  #可以外部调用 来关掉线程。
            #    print 'thread break'
            #    break;  
            #print self.sleep;
            time.sleep(self.sleep) 
            self.__do();
            
    def stop(self):  
        #stop the loop  
        self.thread_stop = True;
        self.isPlay = False; 
        while True:
            if not self.fnPlay : break             
            time.sleep(0.01)

def GetSearchinfo():
    # to do
    pass;
    


if __name__ == "__main__":
    app = web.application(urls, globals())
    #tCheck=MTimerClass(GetSearchinfo, '',  10);
    #tCheck.setDaemon(True); # 随主线程一起结果
    #tCheck.start();         #线程启动
    app.run()
