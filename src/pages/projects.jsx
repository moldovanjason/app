/* eslint-disable no-continue */
/* eslint-disable no-console */
import {
  Box, useColorModeValue, Button, Flex, useDisclosure,
} from '@chakra-ui/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PropTypes from 'prop-types';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';
import FilterModal from '../common/components/FilterModal';
import TitleContent from '../js_modules/projects/TitleContent';
import ProjectList from '../js_modules/projects/ProjectList';
import useFilter from '../common/store/actions/filterAction';
import Search from '../js_modules/projects/Search';

export const getStaticProps = async ({ locale }) => {
  const projects = []; // filtered projects after removing repeated
  let arrProjects = []; // incoming projects
  const resp = await fetch('https://breathecode.herokuapp.com/v1/registry/asset?type=project')
    .then((res) => res.json())
    .catch((err) => console.error(err));

  arrProjects = Object.values(resp);
  if (resp.status >= 200 && resp.status < 400) {
    console.log(`Original projects: ${arrProjects}`);
  } else {
    console.error(`Error fetching projects with ${resp.status}`);
  }

  let technologyTags = [];
  let dificulties = [];

  for (let i = 0; i < arrProjects.length; i += 1) {
    // skip repeated projects
    if (projects.find((p) => arrProjects[i].slug === p.slug)) {
      continue;
    }
    projects.push(arrProjects[i]);

    if (typeof arrProjects[i].technology === 'string') technologyTags.push(arrProjects[i].technology);
    if (Array.isArray(arrProjects[i].technologies)) {
      technologyTags = technologyTags.concat(arrProjects[i].technologies);
    }

    if (typeof arrProjects[i].difficulty === 'string') {
      if (arrProjects[i].difficulty === 'junior') arrProjects[i].difficulty = 'easy';
      else if (arrProjects[i].difficulty === 'semi-senior') arrProjects[i].difficulty = 'intermediate';
      else if (arrProjects[i].difficulty === 'senior') arrProjects[i].difficulty = 'hard';

      dificulties.push(arrProjects[i].difficulty);
    }
  }

  technologyTags = [...new Set(technologyTags)];
  dificulties = [...new Set(dificulties)];

  return {
    props: {
      fallback: false,
      ...(await serverSideTranslations(locale, ['navbar', 'footer'])),
      projects,
      technologyTags,
      dificulties,
    },
  };
};

const Projects = ({ projects, technologyTags, dificulties }) => {
  const { filteredBy, setProjectFilters } = useFilter();
  const { technologies, difficulty, videoTutorials } = filteredBy.projectsOptions;
  const currentFilters = technologies.length
    + (difficulty === undefined || difficulty.length === 0 ? 0 : 1)
    + videoTutorials;

  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <Box height="100%" flexDirection="column" justifyContent="center" alignItems="center">
      <TitleContent title="Projects" mobile />
      <Flex
        justifyContent="space-between"
        flex="1"
        gridGap="20px"
        padding={{ base: '3% 4% 4% 4%', md: '1.5% 10% 1.5% 10%' }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <TitleContent title="Projects" mobile={false} />

        <Search />

        <Button
          variant="outline"
          backgroundColor={useColorModeValue('', 'gray.800')}
          _hover={{ backgroundColor: useColorModeValue('', 'gray.700') }}
          border={currentFilters >= 1 ? 2 : 1}
          onClick={onOpen}
          borderStyle="solid"
          minWidth="125px"
          borderColor={useColorModeValue(
            `${currentFilters >= 1 ? 'blue.default' : '#DADADA'}`,
            'gray.800',
          )}
        >
          <Icon icon="setting" width="20px" height="20px" style={{ minWidth: '20px' }} />
          <Text textTransform="uppercase" pl="10px">
            {currentFilters >= 2 ? 'Filters' : 'Filter'}
          </Text>
          {currentFilters >= 1 && (
            <Text
              as="span"
              margin="0 10px"
              textTransform="uppercase"
              display="flex"
              justifyContent="center"
              alignItems="center"
              backgroundColor="blue.default"
              color="white"
              borderRadius="30px"
              minWidth="20px"
              height="20px"
            >
              {currentFilters}
            </Text>
          )}
        </Button>

        <FilterModal
          isModalOpen={isOpen}
          onClose={onClose}
          setFilter={setProjectFilters}
          technologyTags={technologyTags}
          dificulties={dificulties}
        />
      </Flex>

      <Box flex="1" margin={{ base: '0 4% 0 4%', md: '0 10% 0 10%' }}>
        <Text
          size="md"
          display="flex"
          padding={{ base: '30px 8%', md: '30px 28%' }}
          textAlign="center"
        >
          Practice and develop your coding skills by building real live interactive autograded
          projects with solutions and video tutorials
        </Text>

        <ProjectList
          projects={projects}
          contextFilter={filteredBy.projectsOptions}
          projectPath="interactive-coding-tutorial"
          pathWithDifficulty
        />
      </Box>
    </Box>
  );
};

Projects.propTypes = {
  technologyTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  dificulties: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Projects;
