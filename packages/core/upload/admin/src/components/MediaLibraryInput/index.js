import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Carousel, CarouselSlide } from '@strapi/parts/Carousel';
import getTrad from '../../utils/getTrad';
import { EmptyInput } from './EmptyInput';

export const MediaLibraryInput = ({ intlLabel, description, disabled, error, multiple }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { formatMessage } = useIntl();

  const handleNext = () => {
    setSelectedIndex(current => (current < 2 ? current + 1 : 0));
  };

  const handlePrevious = () => {
    setSelectedIndex(current => (current > 0 ? current - 1 : 2));
  };

  const hint = description
    ? formatMessage(
        { id: description.id, defaultMessage: description.defaultMessage },
        { ...description.values }
      )
    : '';

  const label = intlLabel.id ? formatMessage(intlLabel) : '';

  return (
    <Carousel
      label={label}
      selectedSlide={selectedIndex}
      previousLabel={formatMessage({
        id: getTrad('mediaLibraryInput.actions.previousSlide'),
        defaultMessage: 'Previous slide',
      })}
      nextLabel={formatMessage({
        id: getTrad('mediaLibraryInput.actions.nextSlide'),
        defaultMessage: 'Next slide',
      })}
      onNext={handleNext}
      onPrevious={handlePrevious}
      hint={hint}
      error={error}
    >
      <CarouselSlide
        label={formatMessage(
          { id: getTrad('mediaLibraryInput.slideCount'), defaultMessage: '{n} of {m} slides' },
          { n: 1, m: 1 }
        )}
      >
        <EmptyInput disabled={disabled} multiple={multiple} />
      </CarouselSlide>
    </Carousel>
  );
};

MediaLibraryInput.defaultProps = {
  disabled: false,
  description: undefined,
  error: undefined,
  intlLabel: undefined,
  multiple: false,
};

MediaLibraryInput.propTypes = {
  disabled: PropTypes.bool,
  description: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
    values: PropTypes.shape({}),
  }),
  error: PropTypes.string,
  intlLabel: PropTypes.shape({ id: PropTypes.string, defaultMessage: PropTypes.string }),
  multiple: PropTypes.bool,
};
