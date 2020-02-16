import React, {
  ReactElement,
  FC,
  SVGProps,
  LazyExoticComponent,
  Suspense
} from 'react';
import Loader from '@hackbox/client/components/loader/loader';

interface FileIconProps {
  Icon: LazyExoticComponent<FC<SVGProps<SVGSVGElement>>>;
}

export default function FileIcon({ Icon }: FileIconProps): ReactElement {
  return (
    <Suspense
      fallback={
        <Loader
          spinnerProps={{
            size: 'xs'
          }}
        />
      }
    >
      <Icon width="20px" />
    </Suspense>
  );
}
