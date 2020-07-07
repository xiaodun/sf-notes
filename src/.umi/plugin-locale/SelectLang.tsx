// @ts-nocheck
import React from 'react';
import { Menu, Dropdown } from 'antd';
import { ClickParam } from 'antd/es/menu';
import { DropDownProps } from 'antd/es/dropdown';
import { getLocale, getAllLocales, setLocale } from './localeExports';

export interface HeaderDropdownProps extends DropDownProps {
  overlayClassName?: string;
  placement?:
    | 'bottomLeft'
    | 'bottomRight'
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomCenter';
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  overlayClassName: cls,
  ...restProps
}) => (
  <Dropdown
    overlayClassName={cls}
    {...restProps}
  />
);

interface LocalData {
    lang: string,
    label?: string,
    icon?: string,
    title?: string,
}

interface SelectLangProps {
  globalIconClassName?: string,
  postLocalesData?: (locales: LocalData[]) => LocalData[],
  onItemClick?: (params:ClickParam) => void,
  className?:string;
}

const transformArrayToObject = (allLangUIConfig:LocalData[])=>{
  return allLangUIConfig.reduce((obj, item) => {
    if(!item.lang){
      return obj;
    }

    return {
      ...obj,
      [item.lang]: item,
    };
  }, {});
}

const defaultLangUConfigMap = {
  'zh-CN': {
    lang: 'zh-CN',
    label: '简体中文',
    icon: '🇨🇳',
    title: '语言'
  },
  'zh-TW': {
    lang: 'zh-TW',
    label: '繁体中文',
    icon: '🇭🇰',
    title: '語言'
  },
  'en-US': {
    lang: 'en-US',
    label: 'English',
    icon: '🇺🇸',
    title: 'Language'
  },
  'pt-BR': {
    lang: 'pt-BR',
    label: 'Português',
    icon: '🇧🇷',
    title: 'Idiomas'
  }
};

export const SelectLang: React.FC<SelectLangProps> = (props) => {
  return <></>
};
