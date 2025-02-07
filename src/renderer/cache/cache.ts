/**
 * web存储，提供接口文档离线使用能力
 */
// import { axios } from "@/api/api"
import { Response, ApidocProjectListInfo } from "@@/global";
import db from "./database"

type Api = {
    /**
     * 获取项目列表数据
     */
    "/api/project/project_list": () => Promise<Response<ApidocProjectListInfo>>,
}

const api: Api = {
    "/api/project/project_list": (): Promise<Response<ApidocProjectListInfo>> => new Promise((resolve, reject) => {
        db.transaction("rw", db.projectList, async () => {
            const result = await db.projectList.toArray();
            resolve({
                code: 0,
                msg: "xx",
                data: result[0]
            });
        }).catch((e) => {
            console.error(e);
            reject(e);
        });
    })
}

interface ICaceh {
    dbBase: IDBDatabase | null;
    get<URL extends keyof Api>(url: URL): ReturnType<Api[URL]>;
}

let singleton: null | ICaceh = null;
class Cache implements ICaceh {
    public dbBase: IDBDatabase | null = null;

    constructor() {
        if (!singleton) {
            singleton = this;
        } else {
            return singleton;
        }
    }

    /**
     * 获取数据信息
     */
    public get<URL extends keyof Api>(url: URL): ReturnType<Api[URL]> {
        const apiFn = api[url];
        return apiFn() as ReturnType<Api[URL]>;
    }
}
const cache = new Cache();

export { cache, ICaceh };
