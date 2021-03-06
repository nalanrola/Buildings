/**
 * UIMgr
 * 
 * ui管理器
 * Register,UnRegister,ShowUI,CloseUI
 */
import BaseUI from "./BaseUI";
import Core from "../Core";
import {ResType} from "../CoreDefine";
import {ResStruct} from "../util/ResourcesMgr";

export default class UIMgr
{
    private m_mapUIPool: Map<string,BaseUI>;

    private m_mapShowingUI: Map<string,BaseUI>;
    private m_arrReverseChangeUI: Array<BaseUI>;

    private m_mapUIMapping: Map<string,UIConfig>;

    constructor()
    {
        this.m_mapUIPool = new Map<string,BaseUI>();
        this.m_mapShowingUI = new Map<string,BaseUI>();
        this.m_arrReverseChangeUI = new Array<BaseUI>();
        this.m_mapUIMapping = new Map<string,UIConfig>();
    }

    public Register(uiName: string,uiUrl: string,uiScript: new () => BaseUI)
    {
        if(this.m_mapUIMapping.get(uiName))
        {
            console.log("重复注册UI, UIName: " + uiName);
            return;
        }
        let uiConfig: UIConfig = new UIConfig();
        uiConfig.UIName = uiName;
        uiConfig.UIUrl = uiUrl;
        uiConfig.UIScript = uiScript;
        this.m_mapUIMapping.set(uiName,uiConfig);
    }

    public UnRegister(uiConfig: UIConfig): void
    {
        if(this.m_mapUIMapping.get(uiConfig.UIName))
        {
            this.m_mapUIMapping.delete(uiConfig.UIName);
        }
        else
        {
            console.log("UI未被注册, UIName: " + uiConfig.UIName);
        }
    }

    public getUI(uiName: string): BaseUI
    {
        if(this.m_mapUIPool == null)
        {

            return null;
        }
        return this.m_mapUIPool.get(uiName);
    }

    public ShowUI(uiName: string,...args: any[]): BaseUI
    {
        let uiScript: BaseUI;
        // 已经加载
        if(this.m_mapUIPool.get(uiName))
        {
            uiScript = this.m_mapUIPool.get(uiName);
            if(uiScript.UINode != null)//资源没有加载完成
            {
                this.AddUIToRoot(this.m_mapUIPool.get(uiName),args);
            }
            return uiScript;
        }
        let uiConfig: UIConfig = this.m_mapUIMapping.get(uiName);
        if(!uiConfig)
        {
            console.log("UI未被注册, UIName: " + uiConfig.UIName);
            return;
        }
        this.m_mapUIPool.set(uiName,new uiConfig.UIScript());
        uiScript = this.m_mapUIPool.get(uiName);
        uiScript.UIName = uiName;
        Core.UIMgr.ShowUI("UILoading");//打开loading界面
        Core.ResourcesMgr.LoadRes(ResStruct.CreateRes(uiConfig.UIUrl,ResType.Prefab),function(res)
        {
            uiScript.UINode = cc.instantiate(res);
            uiScript.Init();
            this.AddUIToRoot(uiScript,args);
            Core.UIMgr.CloseUI("UILoading");//打开loading界面
        }.bind(this));

        return uiScript;
    }

    public CloseUI(uiName: string): void
    {
        let ui: BaseUI = this.m_mapUIPool.get(uiName);
        if(!ui) return;
        switch(ui.ShowMode)
        {
            case UIShowMode.Normal:
                if(this.m_mapShowingUI.get(uiName))
                {
                    ui.Hiding();
                    this.m_mapShowingUI.delete(ui.UIName);
                }
                break;
            case UIShowMode.ReverseChange:
                let arrLen: number = this.m_arrReverseChangeUI.length;
                if(this.m_arrReverseChangeUI[arrLen - 1].UIName != uiName) return;
                if(arrLen >= 2)
                {
                    this.m_arrReverseChangeUI[arrLen - 1].Hiding();
                    this.m_arrReverseChangeUI.length = arrLen - 1;
                    this.m_arrReverseChangeUI[arrLen - 2].Redisplay();
                }
                else if(arrLen == 1)
                {
                    this.m_arrReverseChangeUI[0].Hiding();
                    this.m_arrReverseChangeUI.length = 0;
                }
                break;
            case UIShowMode.HideOther:
                if(this.m_mapShowingUI.get(uiName))
                {
                    ui.Hiding();
                    this.m_mapShowingUI.delete(ui.UIName);
                    this.m_mapShowingUI.forEach(function(baseUI: BaseUI)
                    {
                        baseUI.Redisplay();
                    });
                    this.m_arrReverseChangeUI.forEach(function(baseUI: BaseUI)
                    {
                        baseUI.Redisplay();
                    });
                }
                break;
        }
    }

    // 关闭所有ui
    public CloseAllUI(): void
    {
        if(this.m_arrReverseChangeUI.length)
        {
            for(let i: number = this.m_arrReverseChangeUI.length - 1;i >= 0;i--)
            {
                this.m_arrReverseChangeUI[i].Hiding();
            }
        }
        this.m_arrReverseChangeUI.length = 0;

        this.m_mapShowingUI.forEach(function(baseUI: BaseUI)
        {
            baseUI.Hiding();
        });
        this.m_mapShowingUI.clear();
    }

    // 添加ui到ui根节点
    private AddUIToRoot(ui: BaseUI,args: any[] = null): void
    {
        switch(ui.ShowMode)
        {
            case UIShowMode.Normal:
                if(!this.m_mapShowingUI.get(ui.UIName))
                {
                    this.m_mapShowingUI.set(ui.UIName,ui);
                    ui.Display(args);
                }
                break;
            case UIShowMode.ReverseChange:
                let arrLen: number = this.m_arrReverseChangeUI.length;
                if(arrLen > 0)
                {
                    this.m_arrReverseChangeUI[arrLen - 1].Freeze();
                }
                ui.Display(args);
                this.m_arrReverseChangeUI.push(ui);
                break;
            case UIShowMode.HideOther:
                if(!this.m_mapShowingUI.get(ui.UIName))
                {
                    this.m_mapShowingUI.forEach(function(baseUI: BaseUI)
                    {
                        baseUI.Hiding();
                    });
                    this.m_arrReverseChangeUI.forEach(function(baseUI: BaseUI)
                    {
                        baseUI.Hiding();
                    });
                    this.m_mapShowingUI.set(ui.UIName,ui);
                    ui.Display(args);
                }
                break;
        }
    }
}

export class UIConfig
{
    public UIName: string;
    public UIUrl: string;
    public UIScript: new () => BaseUI;
}

export enum UIType
{
    Normal = 1,
    Fixed = 2,
    PopUp = 3,
}

export enum UIShowMode
{
    Normal = 1,
    ReverseChange = 2,
    HideOther = 3,
}