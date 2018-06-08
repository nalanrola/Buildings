import ObjectPool from "./util/ObjectPool";
import Ticker from "./tick/Ticker";
import AudioMgr from "./sound/AudioMgr";
import Random from "./util/Random";
import ResourcesMgr from "./util/ResourcesMgr";
import Log,{LogLevel} from "./log/Log";
import NetMgr,{NetType} from "./net/NetMgr";
import EventMgr from "./event/EventMgr";
import ServerHandler from "./net/ServerHandler";
import InputHandle from "./input/InputHandle";
import AutoObjectPool from "./util/AutoObjectPool";
import LoadingUI from "./UI/LoadingUI";
import SceneMgr from "./scene/SceneMgr";
import SdkHandleMgr from "./sdk/SdkHandleMgr";
import UIRoot from "./uiframe/UIRoot";
import UIMgr from "./uiframe/UIMgr";
import CoreConfig from "./CoreConfig";
import DelayTimer from "./tick/DelayTimer";
import {HTTP_ID} from "./CoreDefine";
import HttpMgr from "./net/HttpMgr";
import HttpHandler from "./net/HttpHandler";
import {Platform} from "./platform/Platform";


export default class Core
{
    private static m_pInstance: Core;
    private static m_pRootNode: cc.Node;

    private static m_pTicker: Ticker;
    private static m_pAudioMgr: AudioMgr;
    private static m_pRandom: Random;
    private static m_pResourcesMgr: ResourcesMgr;

    private static m_pInputHandleMgr: InputHandle;

    // Event
    private static m_pEventMgr: EventMgr;

    // UIRoot
    private static m_pUIRoot: UIRoot;

    // UIMgr
    private static m_pUIMgr: UIMgr;

    // Net
    private static m_pNetMgr: NetMgr;
    private static m_pServerHandler: ServerHandler;
    // Log
    private static m_pLog: Log;

    //loadingUI
    private static m_pSceneMgr: SceneMgr;
    private static m_ploadingUI: LoadingUI;

    //SDK
    private static m_pSdkHandleMgr: SdkHandleMgr;

    //Http
    private static m_pHttpMgr: HttpMgr;
    private static m_pHttpHandler: HttpHandler;

    private static m_pPlatform: Platform;

    public constructor()
    {
    }

    public static Get(): Core
    {
        if(null == Core.m_pInstance)
        {
            Core.m_pInstance = new Core();
        }
        return Core.m_pInstance;
    }

    public Init(): void
    {
        //两种对象池里选一个
        ObjectPool.Init();  //弱类型对象池
        AutoObjectPool.Init();  //强类型对象池

        // Event
        Core.m_pEventMgr || (Core.m_pEventMgr = new EventMgr());

        // UIRoot
        Core.m_pUIRoot || (Core.m_pUIRoot = new UIRoot());

        // UIMgr
        Core.m_pUIMgr || (Core.m_pUIMgr = new UIMgr());

        // 永续节点
        Core.m_pRootNode = cc.find("CoreRoot");
        if(!Core.m_pRootNode)
        {
            Core.m_pRootNode = new cc.Node();
            Core.m_pRootNode.name = "CoreRoot";
        }
        Core.m_pRootNode.anchorX = Core.m_pRootNode.anchorY = 0;
        Core.m_pRootNode.zIndex = 0;
        cc.game.addPersistRootNode(Core.m_pRootNode);

        // Updater
        let com = Core.m_pRootNode.addComponent("Updater");

        // Net
        Core.m_pNetMgr || (Core.m_pNetMgr = new NetMgr());
        Core.m_pServerHandler || (Core.m_pServerHandler = new ServerHandler());
        Core.m_pServerHandler.Init();
        Core.m_pServerHandler.Register();
        // Log
        Core.m_pLog || (Core.m_pLog = new Log());
        Core.m_pLog.Init();

        Core.m_pTicker || (Core.m_pTicker = new Ticker(CoreConfig.GAME_FPS,CoreConfig.FIXED_LENGTH));
        Core.m_pAudioMgr || (Core.m_pAudioMgr = Core.m_pRootNode.addComponent(AudioMgr));
        Core.m_pResourcesMgr || (Core.m_pResourcesMgr = new ResourcesMgr());
        Core.m_pRandom || (Core.m_pRandom = new Random());
        //UI 
        Core.m_pSceneMgr || (Core.m_pSceneMgr = new SceneMgr());
        Core.m_ploadingUI || (Core.m_ploadingUI = new LoadingUI());
        //StepLock _Input
        Core.m_pInputHandleMgr || (Core.m_pInputHandleMgr = new InputHandle());

        //SDK
        Core.m_pSdkHandleMgr || (Core.m_pSdkHandleMgr = new SdkHandleMgr());
        Core.m_pSdkHandleMgr.Init();

        //Http
        Core.m_pHttpMgr || (Core.m_pHttpMgr = new HttpMgr());
        Core.m_pHttpHandler || (Core.m_pHttpHandler = new HttpHandler());
        Core.m_pHttpHandler.Init();

        Core.m_pRandom.Init();

        Core.m_pPlatform || (Core.m_pPlatform = new Platform());
        Core.Log("corelib init succeed");
    }

    public Update(dt: number): void
    {
        Core.m_pTicker.Signal(dt);
    }

    /**
     * 对外暴露
     */
    public static get EventMgr(): EventMgr
    {
        return Core.m_pEventMgr;
    }
    public static get UIRoot(): UIRoot
    {
        return Core.m_pUIRoot;
    }
    public static get UIMgr(): UIMgr
    {
        return Core.m_pUIMgr;
    }
    public static get NetMgr(): NetMgr
    {
        return Core.m_pNetMgr;
    }
    public static get ServerHandler(): ServerHandler
    {
        return Core.m_pServerHandler;
    }
    public static Log(info: string,lv?: LogLevel): void
    {
        Core.m_pLog.Log(info,lv);
    }
    public static get RootNode(): cc.Node
    {
        return Core.m_pRootNode;
    }
    public static get ResourcesMgr(): ResourcesMgr
    {
        return Core.m_pResourcesMgr;
    }

    public static get InputHandleMgr(): InputHandle
    {
        return Core.m_pInputHandleMgr;
    }

    public static get Ticker(): Ticker
    {
        return Core.m_pTicker;
    }
    public static get AudioMgr(): AudioMgr
    {
        return Core.m_pAudioMgr;
    }
    public static get SceneMgr(): SceneMgr
    {
        return Core.m_pSceneMgr;
    }
    public static get Random(): Random
    {
        return Core.m_pRandom;
    }
    public static get LoadingUI(): LoadingUI
    {
        return Core.m_ploadingUI;
    }
    public static get SdkHandleMgr(): SdkHandleMgr
    {
        return Core.m_pSdkHandleMgr;
    }
    public static get DelayTimer(): DelayTimer
    {
        return Core.m_pTicker.DelayTimer;
    }
    public static get HttpMgr(): HttpMgr
    {
        return Core.m_pHttpMgr;
    }
    public static get HttpHandler(): HttpHandler
    {
        return Core.m_pHttpHandler;
    }

}