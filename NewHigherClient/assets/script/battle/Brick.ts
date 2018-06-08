import {ResStruct} from "../../corelibs/util/ResourcesMgr";
import {BattleManager} from "../manager/BattleManager";
import {ConfigData} from "../common/ConfigData";
import Core from "../../corelibs/Core";
import {BrickCell} from "./BrickCell";

/**
 * 砖块类
 * @author zhouyulong
 * 2018年5月24日 14:34:42
 */
export class Brick
{
    /**钩子资源 */
    private readonly Brick_RES: string = "prefabs/brick";
    /**完美资源 */
    private readonly PERFECT_EFFECT_RES: string = "prefabs/PerfectEffect";
    /**砖块资源列表*/
    private brickResList: Array<cc.Node>;
    /**完美特效资源 */
    private perfectRes: cc.Node;
    /**砖块列表 */
    private brickList: Array<BrickCell>;
    /**是否下落中 */
    private isFalling: boolean;
    /**当前的砖块 */
    private currentBrick: BrickCell;
    /**当前下落到高度*/
    private currentFallY: number;
    /**完美列表 */
    private perfectList: Array<BrickCell>;

    constructor()
    {
        this.brickResList = new Array<cc.Node>();
        this.brickList = new Array<BrickCell>();
        this.perfectList = new Array<BrickCell>();
    }

    public init(): void
    {
        let hookRes: Array<ResStruct> = BattleManager.getInstance().arrResData;
        for(let a: number = 0;a < ConfigData.BRICK_COUNT;a++)
        {
            for(let b: number = 0;b < hookRes.length;b++)
            {
                if(hookRes[b].m_sUrl == this.Brick_RES + (a + 1))//砖块资源
                {
                    this.brickResList.push((Core.ResourcesMgr.getRes(hookRes[b].m_iResType,hookRes[b].m_sUrl) as cc.Prefab).data);
                    break;
                }
                else if(hookRes[b].m_sUrl == this.PERFECT_EFFECT_RES)//完美特效资源
                {
                    this.perfectRes = (Core.ResourcesMgr.getRes(hookRes[b].m_iResType,hookRes[b].m_sUrl) as cc.Prefab).data;
                }
            }
        }
    }

    /**
     * 开始游戏
     */
    public startGame(): void
    {
        this.isFalling = false;
        this.currentFallY = ConfigData.INIT_FLOOR_Y;
        this.addBrick(0,300);
    }

    /**
     * 投放砖块
     */
    public putBrick(): void
    {
        if(this.isFalling == false)
        {
            this.isFalling = true;
        }
    }

    /**
     * 帧刷新
     */
    public update(): void
    {
        if(this.isFalling == true)
        {
            if(this.currentBrick != null)
            {
                this.currentBrick.update(0,this.currentFallY,this.endFall.bind(this));
            }
        }
    }

    /**
     * 添加砖块
     */
    private addBrick(_x: number,_y: number): void
    {
        let index: number = Math.floor(Math.random() * this.brickResList.length);
        this.currentBrick = new BrickCell(this.brickList.length,cc.instantiate(this.brickResList[index]),this.perfectRes);
        this.currentBrick.init(BattleManager.getInstance().cameraCanvas);
        this.brickList.push(this.currentBrick);
        this.currentBrick.setPosition(_x,_y);
    }

    /**
     * 结束下落
     */
    private endFall(isPerfect: boolean): void
    {
        if(isPerfect == true)//完美下落
        {
            this.perfectList.push(this.currentBrick);
            if(this.perfectList.length > 1)
            {
                for(let a: number = 0;a < this.perfectList.length;a++)
                {
                    this.perfectList[a].playPerfectEffect();
                }
            }
        }
        else
        {
            this.perfectList.length = 0;
        }
        if(this.isFalling == true)
        {
            this.isFalling = false;
            this.currentFallY = ConfigData.INIT_FLOOR_Y + (this.brickList.length * ConfigData.BRICK_HEIGHT);
            this.addBrick(0,300);
        }
        if(this.brickList.length - 1 >= 3)
        {
            BattleManager.getInstance().moveCameraStart();
        }
    }
}