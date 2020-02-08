import React, {
  useRef,
  MutableRefObject,
  KeyboardEvent,
  ReactElement
} from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  Input,
  FormLabel,
  ModalFooter,
  Button
} from '@chakra-ui/core';
import useFormat from '@hackbox/components/format/format';

interface AddFileOrFolderProps {
  isOpen: boolean;
  onClose: (fileOrFolderName: string | null) => void;
  isFolder: boolean;
}

export default function AddFileOrFolder({
  isOpen,
  onClose,
  isFolder
}: AddFileOrFolderProps): ReactElement {
  const inputRef = useRef() as MutableRefObject<HTMLInputElement>;
  const { color } = useFormat();
  const type = isFolder ? 'folder' : 'file';

  return (
    <Modal onClose={(): void => onClose(null)} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent color={color}>
        <ModalHeader>New {type}</ModalHeader>
        <ModalCloseButton onClick={(): void => onClose(null)} />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>{type} name</FormLabel>
            <Input
              onKeyDown={(evt: KeyboardEvent): void => {
                // enter key has been pressed
                if (evt.keyCode === 13) {
                  onClose(inputRef.current.value);
                }
              }}
              ref={inputRef}
              autoFocus
              placeholder={`Enter the ${type} name and hit enter...`}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            bg="teal.500"
            onClick={(): void => onClose(inputRef.current.value)}
            variantColor="blue"
            mr={3}
          >
            Add
          </Button>
          <Button onClick={(): void => onClose(null)}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
