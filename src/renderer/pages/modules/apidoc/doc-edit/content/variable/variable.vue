/*
    创建者：shuxiaokai
    创建时间：2021-09-15 22:07
    模块名称：全局变量维护
    备注：
*/
<template>
    <div class="s-variable">
        <!-- 新增变量 -->
        <s-fieldset title="新增变量" class="left">
            <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px">
                <el-form-item label="变量名称：" prop="name">
                    <el-input v-model="formInfo.name" size="mini" placeholder="请输入变量名称" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="变量值：" prop="value">
                    <el-input v-model="formInfo.value" size="mini" placeholder="请输入变量值" class="w-100" maxlength="999" clearable></el-input>
                </el-form-item>
                <el-form-item label="值类型" prop="type">
                    <el-select v-model="formInfo.type" size="mini" class="w-100">
                        <el-option value="string" label="string"></el-option>
                        <el-option value="number" label="number"></el-option>
                        <el-option value="boolean" label="boolean"></el-option>
                    </el-select>
                </el-form-item>
                <div class="d-flex j-end">
                    <el-button :loading="loading" type="primary" size="mini" @click="handleAddHost">确认添加</el-button>
                </div>
            </el-form>
        </s-fieldset>
        <!-- 变量列表 -->
        <s-fieldset title="变量列表" class="right">
            <s-table
                ref="table"
                url="/api/project/project_variable"
                delete-many
                delete-url="/api/project/project_variable"
                :delete-params="{ projectId: $route.query.id }"
                :params="{ projectId: $route.query.id }"
            >
                <el-table-column label="变量名称" align="center">
                    <template #default="scope">
                        <el-input v-if="scope.row.__active" v-model="scope.row.name" size="mini" class="w-100" maxlength="100" clearable></el-input>
                        <span v-else>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="变量值" align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <el-input v-if="scope.row.__active" v-model="scope.row.value" size="mini" class="w-100" maxlength="999" clearable></el-input>
                        <span v-else>{{ scope.row.value }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="变量值类型" align="center">
                    <template #default="scope">
                        <el-select v-if="scope.row.__active" v-model="scope.row.type" size="mini" class="w-100">
                            <el-option value="string" label="string"></el-option>
                            <el-option value="number" label="number"></el-option>
                            <el-option value="boolean" label="boolean"></el-option>
                        </el-select>
                        <span v-else>{{ scope.row.type }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="创建者" align="center" prop="creator"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template #default="scope">
                        <el-button v-show="!scope.row.__active && !isEditing" type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button v-show="scope.row.__active" type="text" size="mini" @click="handleSubmitEdit(scope.row)">确认</el-button>
                        <el-button v-show="scope.row.__active" type="text" size="mini" @click="handleCancelEdit(scope.row)">取消</el-button>
                        <el-button type="text" @click="handleDelete(scope.row._id)">删除</el-button>
                    </template>
                </el-table-column>
            </s-table>
        </s-fieldset>
    </div>
</template>

<script lang="ts">
import type { ApidocVariable } from "@@/global"
import { defineComponent } from "vue"

type EditApidocVariable = ApidocVariable & {
    __active?: boolean,
}

export default defineComponent({
    data() {
        return {
            //=====================================请求参数====================================//
            formInfo: {
                name: "", //------------变量名称
                value: "", //-----------变量值
                type: "string", //------------变量类型
            },
            //=====================================表格参数====================================//
            oldEditingData: null,
            //=====================================验证参数====================================//
            rules: {
                name: [{ required: true, message: "请输入变量名称", trigger: "blur" }],
                value: [{ required: true, message: "请输入变量值", trigger: "blur" }],
            },
            //=====================================其他参数====================================//
            isEditing: false,
            loading: false, //=====================添加按钮加载效果
        };
    },
    methods: {
        getData() {
            this.$refs.table.getData();
            // this.$store.dispatch("apidoc/getDocVariable", {
            //     projectId: this.$route.query.id,
            // });
        },
        //新增表格数据
        handleAddHost() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    const params = Object.assign(this.formInfo, {
                        projectId: this.$route.query.id,
                    });
                    this.axios.post("/api/project/project_variable", params).then(() => {
                        this.getData();
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            });
        },
        //让当前行处于修改状态
        handleEdit(row: EditApidocVariable) {
            row.__active = true;
            this.isEditing = true;
            this.oldEditingData = JSON.parse(JSON.stringify(row));
        },
        //确认修改当前行
        handleSubmitEdit(row: EditApidocVariable) {
            row.__active = false;
            const params = {
                ...row,
                projectId: this.$route.query.id,
            };
            this.axios.put("/api/project/project_variable", params).then(() => {
                this.$message.success("修改成功");
                this.getData();
                this.isEditing = false;
            }).catch((err) => {
                console.error(err);
            });
        },
        //取消修改
        handleCancelEdit(row: EditApidocVariable) {
            Object.assign(row, this.oldEditingData)
            row.__active = false;
            this.isEditing = false;
        },
        //=====================================删除====================================//
        //删除一个数据
        handleDelete(_id: string) {
            this.$confirm("此操作将永久删除该域名, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    ids: [_id],
                    projectId: this.$route.query.id,
                };
                this.axios.delete("/api/project/project_variable", { data: params }).then(() => {
                    this.$message.success("删除成功");
                    this.getData();
                }).catch((err) => {
                    console.error(err);
                });
            });
        },
    },
})
</script>

<style lang="scss">
.s-variable {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    width: 100%;
    padding: size(20) size(30);
    display: flex;
    .left {
        flex: 0 0 size(400);
        margin-right: size(10);
    }
    .right {
        flex: 1;
    }
}
</style>
