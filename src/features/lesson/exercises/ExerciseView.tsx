import type { Exercise } from '@/domain/types'
import type { ExerciseProps } from './shared'
import { ChooseTranslationExercise } from './ChooseTranslation'
import { BuildSentenceExercise } from './BuildSentence'
import { TypeTranslationExercise } from './TypeTranslation'
import { MatchPairsExercise } from './MatchPairs'
import { ListenTypeExercise } from './ListenType'
import { ListenChooseExercise } from './ListenChoose'
import { FillBlankExercise } from './FillBlank'
import { ChooseImageExercise } from './ChooseImage'
import { SpeakExercise } from './Speak'

/** Elige el componente según `ex.type`. */
export function ExerciseView(p: ExerciseProps<Exercise>) {
  const { ex } = p
  switch (ex.type) {
    case 'choose-translation': return <ChooseTranslationExercise {...p} ex={ex} />
    case 'build-sentence': return <BuildSentenceExercise {...p} ex={ex} />
    case 'type-translation': return <TypeTranslationExercise {...p} ex={ex} />
    case 'match-pairs': return <MatchPairsExercise {...p} ex={ex} />
    case 'listen-type': return <ListenTypeExercise {...p} ex={ex} />
    case 'listen-choose': return <ListenChooseExercise {...p} ex={ex} />
    case 'fill-blank': return <FillBlankExercise {...p} ex={ex} />
    case 'choose-image': return <ChooseImageExercise {...p} ex={ex} />
    case 'speak': return <SpeakExercise {...p} ex={ex} />
  }
}
