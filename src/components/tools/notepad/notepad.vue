<template>
  <div id="notepad-id">
    <div class="wrapper">
      <div class="card-wrapper" v-if="showModelFlag === 'notepad'">
        <Button
          icon="ios-pricetag"
          class="first-btn tag-btn shj"
          @click="onFlagChange('tag')"
          >标签管理</Button
        >
        <Button
          icon="ios-folder"
          class="first-btn file-btn"
          @click="onFlagChange('file')"
          >文件管理</Button
        >
        <Button
          icon="md-lock"
          class="first-btn key-btn"
          @click="onFlagChange('key')"
          >密钥管理</Button
        >
        <Button @click="onInAdd()" type="primary" long>
          <span>添加</span>
        </Button>
        <Select
          class="filter-select"
          placement="top"
          @on-change="onChangeFilterTag()"
          style="margin-top:10px;"
          v-model="filterTagId"
          clearable
          filterable
          placeholder="标签过滤"
        >
          <Option :key="item.id" v-for="item in tagList" :value="item.id">{{
            item.content
          }}</Option>
        </Select>
        <!-- 记事的展示 -->
        <div v-if="list && list.length > 0">
          <div
            class="card-root"
            v-for="(item, index) in list"
            :key="item.id"
            @mouseover="item.isMouseOver = true"
            @mouseout="item.isMouseOver = false"
          >
            <div>
              <Button
                @click="
                  onInAdd(index + (pagination.page - 1) * pagination.size)
                "
                class="add"
                icon="ios-add"
                style="margin-top:5px"
              ></Button>
            </div>
            <Card class="card" :bordered="false">
              <p slot="title">
                <Icon
                  style="cursor:pointer;"
                  @click="onCopyAll(item.title)"
                  :size="16"
                  class="notepad-title"
                  type="md-book"
                  title="复制标题"
                ></Icon>
                {{ item.title }}
                <span
                  v-if="item.tagId"
                  :style="{ color: getTag(item.tagId).color }"
                  >{{ item.tagId && " - " + getTag(item.tagId).content }}</span
                >
              </p>
              <div slot="extra" v-if="$browserMessage.isPC">
                <!-- 设置了密钥  且被加密的信息 -->
                <Checkbox
                  v-show="publicKey != null && item.isEncrypt"
                  :value="item.isDecripty"
                  @on-change="onToggleEncrypt(item, $event)"
                  >解密</Checkbox
                >
                <Button type="text" @click="onTop(item)">置顶</Button>
                <Icon
                  v-show="
                    !item.isEncrypt || (item.isEncrypt && publicKey != null)
                  "
                  type="ios-open-outline"
                  @click.stop="onInEdit(item, index)"
                  style="margin-right:10px;cursor:pointer;"
                ></Icon>
                <Button @click.stop="onDelete(item)" style="color: red;"
                  >删除</Button
                >
              </div>
              <div @click="onLine($event, item, index)">
                <div style="color: #bab9b9;">
                  <span>创建日期</span>
                  :{{ item.createTime }}
                  <span style="margin-left: 30px;">修改日期</span>
                  :{{ item.updateTime }}
                </div>
                <Row>
                  <Col span="4" offset="20">
                    <Button
                      @click.stop="onCopyAll(item.content)"
                      title="复制全文"
                      ><Icon size="18" type="ios-copy"
                    /></Button>
                  </Col>
                </Row>

                <ShowNotepadComponent
                  @onZoomImg="onZoomImg"
                  :data="item"
                ></ShowNotepadComponent>
              </div>
            </Card>
            <div class="FloatWrapper add">
              <Button
                @click="
                  onInAdd(index + 1 + (pagination.page - 1) * pagination.size)
                "
                style="margin-top:5px;"
                class="right"
                icon="ios-add"
              ></Button>
            </div>
          </div>
          <Page
            :current="pagination.page"
            @on-change="onChangePage"
            style="margin-top: 20px;margin-bottom:20px;float: right;"
            :total="pagination.total"
            :page-size="pagination.size"
            show-total
            simple
          />
        </div>
        <Spin size="large" fix v-if="list === null"></Spin>
        <div class="no-data app" v-if="list && list.length === 0">暂无数据</div>
      </div>
      <!-- 标签管理 -->
      <TagManagerComponent
        v-show="showModelFlag === 'tag'"
        @on-back="onBackNotepadPage"
        v-model="tagList"
        @on-delete-callback="onDeleteTag"
      ></TagManagerComponent>
      <!-- 文件管理 -->
      <FileManagerComponent
        @on-back="onBackNotepadPage"
        v-if="showModelFlag === 'file'"
      ></FileManagerComponent>
      <!-- 密钥管理 -->
      <KeyManagerComponent
        @on-back="onBackNotepadPage"
        :show="showModelFlag === 'key'"
        v-model="publicKey"
      ></KeyManagerComponent>
    </div>
    <!-- 修改记事 -->
    <Modal
      v-model="isShowNotepadModal"
      :mask-closable="false"
      @on-visible-change="onChangeVisible"
    >
      <p slot="header"></p>
      <Checkbox
        v-show="publicKey != null"
        style="margin-bottom:10px;"
        v-model="activNotepad.isEncrypt"
        >加密</Checkbox
      >
      <div
        contenteditable="true"
        @paste="onPaste($event, activNotepad)"
        @drop="onDropFile($event, activNotepad)"
        @dragover="onDragOver"
      >
        <!-- 复制桌面图片在Windows上不可行 -->
        <Input
          ref="autoFocusInput"
          @on-keyup.ctrl.enter="onCloseEditModel(activNotepad, activeIndex)"
          :clearable="true"
          :rows="10"
          placeholder="支持普通链接、图片链接、黏贴网络图片、拖拽桌面图片、```格式化代码"
          v-model="activNotepad.content"
          type="textarea"
        />
      </div>
      <br />
      <br />
      <Select v-model="activNotepad.tagId" clearable filterable>
        <Option :key="item.id" v-for="item in tagList" :value="item.id">{{
          item.content
        }}</Option>
      </Select>
      <br />
      <br />
      <Input
        :clearable="true"
        placeholder="输入标题"
        v-model="activNotepad.title"
      />

      <div slot="footer">
        <Button
          :loading="activNotepad.loadCount != 0"
          @click="onCloseEditModel(activNotepad, activeIndex)"
          type="primary"
          >确定</Button
        >
      </div>
    </Modal>
    <!--  -->
    <Modal v-model="isZoomImg" footer-hide fullscreen title="放大图片">
      <img :style="{ 'max-width': '100%' }" :src="activeImgSrc" alt />
    </Modal>
  </div>
</template>
<script src="./notepad.js">
</script>

<style lang="less" src="./notepad.less">
</style>
