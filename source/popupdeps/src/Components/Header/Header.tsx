// @ts-nocheck
import cx from 'clsx';
import { useEffect, useState } from 'react';
import {
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Tabs,
  Burger,
  rem,
  Box,
  Drawer,
  ScrollArea,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLogout,
  IconChevronDown,
} from '@tabler/icons-react';
import classes from './Header.module.css';
import mflogofull from '/mflogo_full.svg';
import { useAuth } from '../Contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, signOut } from 'firebase/auth/web-extension';
import LoginButton from '../LoginButton';
import { auth } from '../../services/firebase';

const fallback = {
  name: 'Jane Spoonfighter',
  email: 'janspoon@fighter.dev',
  image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
};
type Tab = {
  name: string;
  url: string;
  protected: boolean;
}

const tabs: Record<string, Tab> = {
  home: {
    name: 'Home',
    url: '/',
    protected: false,
  },
  // templates: {
  //   name: 'Templates',
  //   url: '/templates',
  //   protected: false,
  // },
  // settings: {
  //   name: 'Settings',
  //   url: '/settings',
  //   protected: true,
  // }
}

export default function Header() {
  const { user }: { user: User | null } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(location.pathname);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);


  useEffect(() => {
    if (location.pathname === '/popup/index.html') {
      setActiveTab('/');
    } else {
        setActiveTab(location.pathname);
    }
  }, [location.pathname]);

  const handleTabChange = (value: any) => {
    setActiveTab(value);
    navigate(value);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={classes.header}>
      <Box>
        <Container className={classes.mainSection} size="lg">
          <Group justify="space-between">
            <img src={mflogofull} className={classes.logo} alt="Mail Frames logo" />

            <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="xs" size="sm" />

            {/* if authenticated, show following menu */}
            {
              user &&
              <Menu
                width={260}
                position="bottom-end"
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                withinPortal
              >
                <Menu.Target>
                  <UnstyledButton
                    visibleFrom='xs'
                    className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                  >
                    <Group gap={7}>
                      <Avatar src={user.photoURL || fallback.image} alt={user.displayName || fallback.name} radius="xl" size={20} />
                      <Text fw={500} size="sm" lh={1} mr={3}>
                        {user.displayName || fallback.name}
                      </Text>
                      <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Settings</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            }

            {/* if not authenticated, show login button to open mantine modal to sign in */}
            {
              !user &&
              <LoginButton
                visibleFrom='xs'
                onClick={() => {
                  closeDrawer();
                }}
              />
            }
          </Group>
        </Container>
        <Container size="md">
          <Tabs
            value={activeTab}
            defaultValue="Home"
            variant="outline"
            visibleFrom='xs'
            classNames={{
              root: classes.tabs,
              list: classes.tabsList,
              tab: classes.tab,
            }}
            onChange={handleTabChange}
          >
            <Tabs.List>{
              Object.keys(tabs).map((tab) => {
                if (tabs[tab].protected && !user) {
                  return null;
                }
                return (
                  <Tabs.Tab value={tabs[tab].url} key={tab}>
                    {tabs[tab].name}
                  </Tabs.Tab>
                )
              })
            }</Tabs.List>
          </Tabs>
        </Container>
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="100%"
          padding="md"
          hiddenFrom="sm"
          zIndex={1000000}
        >
          <ScrollArea style={{ textAlign: "center" }} h={`calc(100dvh - ${rem(80)})`} mx="-md">
            <Divider my="sm" />

            {
              Object.keys(tabs).map((tab) => {
                if (tabs[tab].protected && !user) {
                  return null;
                }
                return (
                  <Link to={tabs[tab].url} className={classes.link} onClick={closeDrawer}>{tabs[tab].name}</Link>
                )
              })
            }
            <Divider my="sm" />
            {
              user &&
              <Menu
                // width={260}
                position="bottom-end"
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                withinPortal
              >
                <Menu.Target>
                  <UnstyledButton
                    hiddenFrom='sm'
                    className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                  >
                    <Group gap={7}>
                      <Avatar src={user.photoURL || fallback.image} alt={user.displayName || fallback.name} radius="xl" size={20} />
                      <Text fw={500} size="sm" lh={1} mr={3}>
                        {user.displayName || fallback.name}
                      </Text>
                      <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown style={{ zIndex: "111111111" }}>
                  <Menu.Label>Settings</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            }
            {
              !user &&
                <LoginButton 
                onClick={() => {
                  closeDrawer();
                }} />
            }
          </ScrollArea>
        </Drawer>
      </Box>
    </div>
  );
}