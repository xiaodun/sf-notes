<template>
  <div id="file_manager-vue-id">
    <Button class="first-btn" @click="$emit('on-back')">返回</Button>
    <Alert v-if="$browserMessage.isWeChat">微信内置浏览器不支持下载!</Alert>
    <Upload
      :on-progress="onUploadProgress"
      :on-error="onUploadError"
      :on-success="onGet"
      ref="upload"
      :show-upload-list="false"
      :paste="true"
      :action="BuiltServiceConfig.prefix + requestPrefix + '/upload'"
      type="drag"
      multiple
    >
      <div style="height:200px;line-height:200px;">点击或拖拽上传</div>
    </Upload>
    <!-- 上传 -->
    <div class="upload-wrapper">
      <!-- 正在上传的文件 -->
      <transition-group tag="div" name="uploading">
        <div class="uploading" :key="item.id" v-for="item in uploadingList">
          <div>{{ item.name }}</div>
          <Progress :percent="item.percent" />
        </div>
      </transition-group>
      <div class="check-wrapper">
        <div class="toggle">
          批处理:&nbsp;&nbsp;<i-switch
            v-model="isBatch"
            @on-change="onChangeBatchSwitch"
          ></i-switch>
        </div>
        <div v-show="isBatch">
          <Checkbox @on-change="onCheckedAll" v-model="isCheckedAll"
            >全选</Checkbox
          >
          <Button type="warning" @click="onBatchConfirmDelFile">删除</Button>
          <Button @click="onBatchDownload">下载</Button>
        </div>
      </div>
      <!-- 已经上传完毕 -->
      <div
        :class="{ download: downloadList.includes(item.id) }"
        class="file"
        :key="item.id"
        v-for="(item, index) in uploadList"
      >
        <Row>
          <CheckboxGroup v-model="checkedFileList">
            <Col v-show="isBatch" span="2" style="height:32px;line-height:32px;"
              ><Checkbox :label="item.id">&nbsp;</Checkbox></Col
            >

            <Col :span="isBatch ? 8 : 10">
              <div class="name" @click="onToggleChecked(item)">
                {{ item.name }}
              </div>
            </Col>
            <Col class="option" span="12" offset="1">
              <Button
                v-if="!$browserMessage.isWeChat"
                icon="md-download"
                :loading="item.isDownloading"
                style="margin-right:10px"
                title="下载"
                shape="circle"
                @click="onDownload(item)"
              ></Button>
              <Button
                shape="circle"
                icon="md-remove"
                title="删除"
                style="margin-right:10px"
                @click="onConfirmDelete(item)"
              ></Button>

              <Button
                shape="circle"
                title="备注"
                icon="md-information"
                style="margin-right:10px"
                @click="inUpdateModal(item)"
              ></Button>
              <Button
                shape="circle"
                icon="md-eye"
                title="预览"
                @click="onPreviewFile(item, index)"
              ></Button>
            </Col>
            <Col span="20" v-if="item.describe">
              <div class="fileinfo">{{ item.describe }}</div>
            </Col>
          </CheckboxGroup>
        </Row>
      </div>
    </div>
    <Modal
      title="修改描述"
      :mask-closable="false"
      v-model="isShowUpdate"
      @on-ok="onUpdate(activeFile)"
    >
      <div>
        <Input
          ref="updateDom"
          @on-keyup.ctrl.enter="onUpdate(activeFile)"
          type="textarea"
          v-model="activeFile.describe"
        />
      </div>
    </Modal>
    <Modal
      title="预览文件"
      v-model="isPreviewFile"
      footer-hide
      :mask-closable="false"
      class="preview-modal-9b45763"
      @on-cancel="onClosePreviewFileModal"
    >
      <div class="container">
        <Row type="flex" align="middle" class="row">
          <Col span="4" class="label">名称:</Col>
          <Col span="20">
            <div class="name">{{ activePreview.name }}</div>
          </Col>
        </Row>
        <Row type="flex" align="middle" class="row">
          <Col span="4" class="label">类型:</Col>
          <Col span="20">
            <RadioGroup
              v-model="activePreview.type"
              @on-change="onChangFileType()"
            >
              <Radio :disabled="computedDisabledFileRadio" :label="FileType.txt"
                >文本</Radio
              >
              <Radio :disabled="computedDisabledFileRadio" :label="FileType.img"
                >图片</Radio
              >
              <Radio
                :disabled="computedDisabledFileRadio"
                :label="FileType.audio"
              >
                音频</Radio
              >
              <Radio
                :disabled="computedDisabledFileRadio"
                :label="FileType.video"
                >视频</Radio
              >
            </RadioGroup>
          </Col>
        </Row>
        <Row
          type="flex"
          align="middle"
          class="row"
          v-if="activePreview.type === FileType.txt"
        >
          <Col span="4" class="label">编码:</Col>
          <Col span="10">
            <Input
              v-model="defaultEncode"
              @on-keyup.enter="onParseFile(FileType.txt)"
            ></Input>
          </Col>
          <Col offset="1" span="4">
            <Button @click="onParseFile(FileType.txt)">解析</Button>
          </Col>
        </Row>
        <Row>
          <div v-if="activePreview.isLoading">
            解析中...
          </div>
          <div v-else>
            <div v-if="activePreview.type">
              <div class="txt" v-if="activePreview.type === FileType.txt">
                {{ activePreview.txtContent }}
              </div>
              <div class="img" v-if="activePreview.type === FileType.img">
                <img :src="activePreview.imgSrc" />
              </div>
              <div class="audio" v-if="activePreview.type === FileType.audio">
                <audio controls :src="activePreview.audioSrc"></audio>
              </div>
              <div class="video" v-if="activePreview.type === FileType.video">
                <video controls :src="activePreview.videoSrc"></video>
              </div>
            </div>
            <div v-else class="no-preview">
              该文件不在内置的可预览的文件类型中!可自行尝试!
            </div>
          </div>
        </Row>
      </div>
      <Button
        class="change-source left"
        shape="circle"
        icon="ios-arrow-back"
        size="large"
        @click.stop="onChangePrevious"
      ></Button>
      <Button
        @click.stop="onChangeNext"
        size="large"
        class="change-source right"
        shape="circle"
        icon="ios-arrow-forward"
      ></Button>
    </Modal>
  </div>
</template>
<script src="./file_manager.js">
</script>
<style lang="less" src="./file_manager.less" ></style>