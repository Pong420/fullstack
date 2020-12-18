import React from 'react';
import { useRouter } from 'next/router';
import { Icon, IIconProps } from '@blueprintjs/core';
import { withMainMenuOverLay } from '@/components/client/MainMenuOverlay';
import classes from './BottomNavigation.module.scss';

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

interface ItemProps extends DivProps {
  icon?: IIconProps['icon'];
  isActive?: boolean;
}

function Item({ icon, children, isActive, ...props }: ItemProps) {
  return (
    <div
      {...props}
      className={[classes['item'], isActive ? classes['active'] : '']
        .join(' ')
        .trim()}
    >
      <Icon icon={icon} />
      <div className={classes['text']}>{children}</div>
    </div>
  );
}

function NavItem({ path, ...props }: ItemProps & { path: string }) {
  const { asPath, push } = useRouter();
  return (
    <Item {...props} isActive={asPath === path} onClick={() => push(path)} />
  );
}

const MainMenuTrigger = withMainMenuOverLay(Item);

export function BottomNavigation() {
  return (
    <div className={classes['bottom-navigation']}>
      <NavItem icon="book" path="/">
        書架
      </NavItem>
      <NavItem icon="star" path="/explore">
        精選
      </NavItem>
      <Item icon="search">搜索</Item>
      <MainMenuTrigger icon="menu">選項</MainMenuTrigger>
    </div>
  );
}