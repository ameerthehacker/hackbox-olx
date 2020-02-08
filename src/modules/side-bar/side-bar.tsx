import React, {
  ReactElement,
  useState,
  useEffect,
  useContext,
  lazy,
  LazyExoticComponent,
  Suspense
} from 'react';
import ReactDOM from 'react-dom';
import { Box, Flex } from '@chakra-ui/core';
import useFormat from '@hackbox/components/format/format';
import { FaCopy, FaCog } from 'react-icons/fa';
import SideBarIcon from './components/side-bar-icon/side-bar-icon';
import { IconType } from 'react-icons/lib/cjs';
import { FileExplorerProps } from './components/file-explorer/file-explorer';
import { FSContext } from '@hackbox/contexts/fs';
import SplitPane from 'react-split-pane';
import Loader from '@hackbox/components/loader/loader';

interface SideBarSection {
  icon: IconType;
  Elem: LazyExoticComponent<any>;
  props?: FileExplorerProps;
}

interface SideBarProps {
  children?: ReactElement;
}

// Lazy loaded components
const FileExplorer = lazy(() =>
  import('./components/file-explorer/file-explorer')
);
const Settings = lazy(() => import('./components/settings/settings'));

export default function SideBar({ children }: SideBarProps): ReactElement {
  const { bgColor, color } = useFormat();
  const fs = useContext(FSContext);
  const sideBarSections: SideBarSection[] = [
    {
      icon: FaCopy,
      Elem: FileExplorer,
      props: {
        fs,
        rootPath: '.'
      }
    },
    {
      icon: FaCog,
      Elem: Settings
    }
  ];
  const [activeSideBarIconIndex, setActiveSideBarIndex] = useState(-1);

  useEffect(() => {
    setActiveSideBarIndex(0);
  }, [setActiveSideBarIndex]);

  return (
    <Flex>
      <Box
        color={color}
        bg={bgColor}
        py={0.5}
        borderRightWidth="1px"
        height="calc(100vh - 55px)"
        width="65px"
      >
        {sideBarSections.map(({ icon, Elem, props }, index) => (
          <Box key={index}>
            <SideBarIcon
              onClick={(): void => setActiveSideBarIndex(index)}
              icon={icon}
              isActive={activeSideBarIconIndex === index}
            />
            {/* TODO: better fallback if sidebar section does not exists */}
            {activeSideBarIconIndex === index
              ? ReactDOM.createPortal(
                  <Suspense
                    fallback={
                      <Loader
                        spinnerProps={{
                          color: 'teal.600',
                          size: 'xl',
                          thickness: '4px'
                        }}
                      />
                    }
                  >
                    <Elem {...props} />
                  </Suspense>,
                  document.getElementById('sidebar-section') || document.body
                )
              : null}
          </Box>
        ))}
      </Box>
      <SplitPane
        minSize="120"
        style={{
          height: 'calc(100vh - 57px)',
          marginTop: '2px',
          marginLeft: '65px'
        }}
        defaultSize={200}
      >
        <Box
          bg={bgColor}
          color={color}
          borderRightWidth="1px"
          height="100%"
          id="sidebar-section"
        >
          {/* portal for the side bar section */}
        </Box>
        <Box>{children}</Box>
      </SplitPane>
    </Flex>
  );
}
