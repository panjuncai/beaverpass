"use client"
import { Tabs } from 'antd-mobile'
export default function DealsPage() {
  return (
    <>
    <div className="flex flex-col h-full justify-center items-center">
    <Tabs>
          <Tabs.Tab title='水果' key='fruits'>
            
            <Tabs>
              <Tabs.Tab title='水果' key='fruits'>
                菠萝
              </Tabs.Tab>
              <Tabs.Tab title='蔬菜' key='vegetables'>
                西红柿
              </Tabs.Tab>
            </Tabs> 
          </Tabs.Tab>
          <Tabs.Tab title='蔬菜' key='vegetables'>
            西红柿
          </Tabs.Tab>
          <Tabs.Tab title='动物' key='animals'>
            蚂蚁
          </Tabs.Tab>
        </Tabs>
    </div>
    </>
  )
}