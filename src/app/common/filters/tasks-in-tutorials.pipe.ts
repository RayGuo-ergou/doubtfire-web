import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tasksInTutorials',
})
export class TasksInTutorialsPipe implements PipeTransform {
  transform(tasks, tutorialIds: number[], forceStream: boolean): any[] {
    // Return nothing if there are no tasks
    if (!tasks) {
      return tasks;
    }

    // Return nothing if there is no tutorialIds
    if (tutorialIds.length === 0) {
      return [];
    }

    // Filter the tasks to only those where the tutorial for the task is in the list of tutorial ids
    const result = tasks?.filter((task) => {
      // Get the stream for the task... this may be nil or undefined if there are no streams in the unit
      const stream = task.unit().tutorialStreamForAbbr(task.definition.tutorial_stream);

      const useStream = forceStream && stream;

      // If there is no stream, and the task is a group task, and there is a group for the task
      if (!useStream && task?.isGroupTask() && task.group()) {
        // use the group's tutorial
        const tute_id = task.group().tutorial_id;
        return tutorialIds.includes(tute_id); // check group tutorial id is in the list of ids to include
      } else {
        // either we have a stream, or its not a group task, or the student isn't in a group

        if (forceStream) {
          // Get the tutorial for the stream... this will return the only tutorial if there is no stream
          const tutorial = task?.project().tutorialForStream(stream);
          // Check it is in the list... enrolment may be null if the student is not enrolled in a tutorial
          return tutorialIds.includes(tutorial?.id);
        } else {
          const enrolments = task?.project().tutorial_enrolments;
          return enrolments?.filter((enrolment) => tutorialIds.includes(enrolment.tutorial_id)).length;
        }
      }
    });
    return result;
  }
}
