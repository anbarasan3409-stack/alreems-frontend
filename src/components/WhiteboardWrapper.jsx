'use client';
import SimpleWhiteboard from './SimpleWhiteboard';

/**
 * WhiteboardWrapper renders SimpleWhiteboard directly
 */
const WhiteboardWrapper = (props) => {
  return <SimpleWhiteboard {...props} />;
};

export default WhiteboardWrapper;
